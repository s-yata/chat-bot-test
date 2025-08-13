#!/usr/bin/env python3

import asyncio
from datetime import datetime
import json
import os
import websockets
# from websockets.asyncio.server import serve
from openai import OpenAI

# 認証トークンの定義
TOKEN = "MySecretToken"

client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])

# 認証付きハンドラー
async def handler(websocket):
  print("waiting")
  # 初めにクライアントからトークンを受け取る
  try:
    token = await websocket.recv()
    if token != TOKEN:
      print(f"Invalid token from {websocket.remote_address}")
      await websocket.close()  # 認証失敗時は接続を切断
      return
    print(f"Client {websocket.remote_address} authenticated successfully.")
  except websockets.ConnectionClosed:
    print(f"Connection closed during authentication from {websocket.remote_address}.")
    return

  # クライアントからのメッセージを受信する
  async def receive_messages():
    previous_response_id=None
    try:
      async for message in websocket:
        request = json.loads(message)
        print(f"Received from client: {request}")
        response = client.responses.create(
          model="gpt-5-mini",
          input=[
            {
              "role": "user",
              "content": request["text"],
            }
          ],
          previous_response_id = previous_response_id
        )
        data = {
          "text": response.output_text,
          "timestamp": datetime.now().isoformat()
        }
        print("data: ", data)
        await websocket.send(json.dumps(data))
        previous_response_id = response.id
    except websockets.ConnectionClosed:
      print(f"Connection with {websocket.remote_address} closed.")
    print(message)

  try:
    await asyncio.gather(receive_messages())
  except websockets.ConnectionClosed:
    print(f"Client {websocket.remote_address} disconnected.")

async def main():
  async with websockets.serve(handler, "localhost", 8765):
    print("WebSocket server started on ws://localhost:8765")
    await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
