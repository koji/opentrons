import gradio as gr
import requests
import uuid

def generate_unique_name():
    unique_name = str(uuid.uuid4()) + ".py"
    return unique_name

def send_post_request(payload):
    url = "https://baxin-simulator.hf.space/protocol"
    protocol_name = generate_unique_name()
    data = {"name": protocol_name, "content": payload}
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=data, headers=headers)

    if response.status_code != 200:
        print("Error: " + response.text)
        return "Error: " + response.text

    # Check the response before returning it
    response_data = response.json()
    if "error_message" in response_data:
        print("Error in response:", response_data["error_message"])
        return response_data["error_message"]
    elif "protocol_name" in response_data:
        print("Protocol executed successfully. Run log:", response_data["run_log"])
        return response_data["run_log"]
    else:
        print("Unexpected response:", response_data)
        return "Unexpected response"

def send_message(text, chatbot):
   # Send POST request and get response
   response = send_post_request(text)
   # Update chatbot with response
   chatbot.append(("opentrons_simulator result", response))
   return chatbot

with gr.Blocks() as app:
    textbox = gr.Textbox()
    send_button = gr.Button(value="Send")
    chatbot = gr.Chatbot()
    clear_button = gr.ClearButton([textbox, chatbot])
    send_button.click(send_message, [textbox, chatbot], [chatbot])

app.launch()
