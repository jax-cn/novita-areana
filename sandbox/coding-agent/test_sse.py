#!/usr/bin/env python3
"""Test script for SSE streaming."""

import requests
import json
import sys


def test_sse_streaming():
    """Test SSE streaming endpoint."""
    url = "http://127.0.0.1:8000/generate"
    payload = {
        "prompt": "Add hello world",
        "workdir": "/Users/jax/workspaces/novita-areana/sandbox/test-app",
    }

    print("🧪 Testing SSE streaming...")
    print(f"📤 Request: POST {url}")
    print(f"📝 Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)

    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Accept": "text/event-stream"},
            stream=True,
            timeout=30,
        )

        print(f"📥 Response Status: {response.status_code}")
        print(f"📦 Headers: {dict(response.headers)}")
        print("-" * 60)

        event_count = 0
        for line in response.iter_lines():
            if line:
                line_str = line.decode("utf-8")
                event_count += 1

                if line_str.startswith(":"):
                    print(f"💓 Comment: {line_str}")
                elif line_str.startswith("data:"):
                    data_str = line_str[5:].strip()
                    try:
                        data = json.loads(data_str)
                        event_type = data.get("type", "unknown")
                        print(f"📨 Event {event_count}: {event_type}")
                        if event_type == "started":
                            print(f"   Model: {data.get('data', {}).get('model')}")
                        elif event_type == "completed":
                            print(
                                f"   Duration: {data.get('data', {}).get('total_duration_ms')}ms"
                            )
                        elif event_type == "error":
                            print(f"   Error: {data.get('data', {}).get('message')}")
                    except json.JSONDecodeError:
                        print(f"⚠️  Invalid JSON: {data_str}")
                else:
                    print(f"❓ Unknown: {line_str}")

                # Stop after a few events for testing
                if event_count >= 10:
                    print("-" * 60)
                    print(f"⏱️  Stopping after {event_count} events (test mode)")
                    break

        print("-" * 60)
        print(f"✅ Total events received: {event_count}")

    except requests.exceptions.Timeout:
        print("⏱️  Request timed out after 30 seconds")
        sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - is the server running?")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    test_sse_streaming()
