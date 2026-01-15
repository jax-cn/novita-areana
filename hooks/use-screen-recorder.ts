import { useState, useRef, useEffect, useCallback, RefObject } from 'react'
import RecordRTC from 'recordrtc'

export type VideoFormat = 'webm' | 'mp4'

export interface UseScreenRecorderOptions {
  onRecordingComplete?: (blob: Blob, format: VideoFormat) => void;
  onError?: (error: Error) => void;
  preferredFormat?: VideoFormat;
  /**
   * Convert to MP4 after recording (requires FFmpeg.wasm)
   * Note: This is async and may take time depending on video length
   */
  convertToMp4?: boolean;
}

export interface UseScreenRecorderReturn {
  isRecording: boolean;
  recordingTime: number;
  recordedBlob: Blob | null;
  recordedFormat: VideoFormat | null;
  previewContainerRef: RefObject<HTMLDivElement | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  isConverting: boolean;
}

/**
 * Hook for recording screen captures with Region Capture API support
 *
 * @param options - Configuration options
 * @returns Recording state and controls
 *
 * @example
 * ```tsx
 * const { isRecording, recordingTime, recordedBlob, previewContainerRef, startRecording, stopRecording } = useScreenRecorder({
 *   onRecordingComplete: (blob) => console.log('Recording complete:', blob),
 * })
 *
 * return (
 *   <div ref={previewContainerRef}>
 *     <button onClick={isRecording ? stopRecording : startRecording}>
 *       {isRecording ? 'Stop' : 'Start'}
 *     </button>
 *   </div>
 * )
 * ```
 */
export function useScreenRecorder(options: UseScreenRecorderOptions = {}): UseScreenRecorderReturn {
  const { onRecordingComplete, onError, preferredFormat = 'mp4', convertToMp4 = false } = options

  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedFormat, setRecordedFormat] = useState<VideoFormat | null>(null)
  const [isConverting, setIsConverting] = useState(false)

  const recorderRef = useRef<RecordRTC | MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Detect supported video format
  const getSupportedFormat = useCallback((): { mimeType: string; format: VideoFormat } => {
    const formats = [
      // MP4 formats - use avc3 to avoid codec description changes
      { mimeType: 'video/mp4; codecs=avc3,mp4a', format: 'mp4' as VideoFormat },
      { mimeType: 'video/mp4; codecs=avc1.42E01E,mp4a.40.2', format: 'mp4' as VideoFormat },
      { mimeType: 'video/mp4; codecs=h264,aac', format: 'mp4' as VideoFormat },
      { mimeType: 'video/mp4', format: 'mp4' as VideoFormat },
      // WebM formats as fallback
      { mimeType: 'video/webm; codecs=h264', format: 'webm' as VideoFormat },
      { mimeType: 'video/webm; codecs=vp9', format: 'webm' as VideoFormat },
      { mimeType: 'video/webm', format: 'webm' as VideoFormat },
    ]

    for (const { mimeType, format } of formats) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('[useScreenRecorder] Supported format:', mimeType)
        return { mimeType, format }
      }
    }

    console.warn('[useScreenRecorder] No supported format found, falling back to webm')
    return { mimeType: 'video/webm', format: 'webm' }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (recorderRef.current) {
        const recorder = recorderRef.current as any
        // RecordRTC has destroy(), MediaRecorder doesn't need cleanup
        if (recorder.destroy && typeof recorder.destroy === 'function') {
          recorder.destroy()
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Start recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      // Clear previous blob and format
      setRecordedBlob(null)
      setRecordedFormat(null)
      setRecordingTime(0)
      chunksRef.current = []

      // Use preferCurrentTab to automatically select current tab
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
        preferCurrentTab: true,
      } as any)

      streamRef.current = stream

      const videoTrack = stream.getVideoTracks()[0]

      // Try to crop to the preview container using Region Capture API
      if (previewContainerRef.current && 'CropTarget' in window) {
        try {
          const cropTarget = await (window as any).CropTarget.fromElement(
            previewContainerRef.current
          )
          // Use cropTo() method as per MDN documentation
          await (videoTrack as any).cropTo(cropTarget)
          console.log('[useScreenRecorder] Successfully cropped to preview area')
        } catch (cropError) {
          console.warn('[useScreenRecorder] Failed to crop to element:', cropError)
          // Continue without cropping (full tab)
        }
      }

      // Get supported format (prefer MP4)
      const { mimeType, format } = getSupportedFormat()
      console.log('[useScreenRecorder] Requested format:', format, 'with mimeType:', mimeType)

      // Use MediaRecorder directly for better format support
      const mediaRecorder = new MediaRecorder(stream, { mimeType })

      // Log the actual mimeType that the recorder is using
      console.log('[useScreenRecorder] Recorder created with actual mimeType:', mediaRecorder.mimeType)

      // If the actual mimeType differs from what we requested, log it
      if (mediaRecorder.mimeType !== mimeType) {
        console.warn('[useScreenRecorder] Browser changed mimeType to:', mediaRecorder.mimeType)
      }

      // Collect data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      recorderRef.current = mediaRecorder
      setRecordedFormat(format)
      setIsRecording(true)

      // Handle user stopping the share via browser UI
      videoTrack.onended = () => {
        stopRecording()
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to start recording')
      console.error('[useScreenRecorder] Error starting recording:', err)
      onError?.(err)
    }
  }, [onError, getSupportedFormat])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      const recorder = recorderRef.current as MediaRecorder

      recorder.onstop = () => {
        // Get the actual mimeType from the recorder
        const actualMimeType = (recorderRef.current as MediaRecorder).mimeType

        // Create blob from collected chunks using the recorder's actual mimeType
        const blob = new Blob(chunksRef.current, {
          type: actualMimeType,
        })

        console.log('[useScreenRecorder] Recording complete:', {
          size: blob.size,
          requestedFormat: recordedFormat,
          requestedMimeType: `${recordedFormat}/mp4`,
          actualMimeType: actualMimeType,
          blobType: blob.type,
        })

        // Update format based on actual blob type
        const actualFormat = blob.type.includes('mp4') ? 'mp4' : 'webm'
        if (actualFormat !== recordedFormat) {
          console.warn('[useScreenRecorder] Format mismatch! Requested:', recordedFormat, 'Got:', actualFormat)
        }

        setRecordedBlob(blob)
        onRecordingComplete?.(blob, actualFormat)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
          streamRef.current = null
        }

        setIsRecording(false)
        setRecordingTime(0)
      }

      recorder.stop()
    }
  }, [isRecording, onRecordingComplete, recordedFormat])

  const resetRecording = useCallback(() => {
    setRecordedBlob(null)
    setRecordedFormat(null)
    setRecordingTime(0)
    setIsRecording(false)
    setIsConverting(false)
  }, [])

  return {
    isRecording,
    recordingTime,
    recordedBlob,
    recordedFormat,
    previewContainerRef,
    startRecording,
    stopRecording,
    resetRecording,
    isConverting,
  }
}
