import json
import re
from pathlib import Path
from urllib.request import urlopen

# This tool does the following:
# - Loads the official protocol JSON
# - Updates it in OBSAdvanced.js (the full stuff is added as a variable at the end)
# - Generates commands into module.json

# DOCS: https://benkuper.notion.site/Making-your-own-Module-f892f4150bc74dc1b851ba1a3c99510d

# Define file paths
script_directory = str(Path(__file__).resolve().parent)
protocol_url = "https://raw.githubusercontent.com/obsproject/obs-websocket/master/docs/generated/protocol.json"
obsng_js_path = script_directory+"/../OBSAdvanced.js"
module_json_path = script_directory+"/../module.json"


# === Download and parse the protocol JSON
response = urlopen(protocol_url)
protocol_data = json.loads(response.read().decode("utf-8"))

# === Replace the content in OBSNG.js
with open(obsng_js_path, "r") as obsng_file:
    obsng_content = obsng_file.read()

# Extract the generated code section
start_marker = "// <GENERATED-CODE-API>"
end_marker = "// </GENERATED-CODE-API>"

# Properly encode JSON to ensure valid JavaScript
api_data = json.dumps(protocol_data, indent=2)
api_data_js_safe = api_data.replace("\\", "\\\\")
new_generated_code = f"{start_marker}\nvar API = {api_data_js_safe};\n{end_marker}"
obsng_content = re.sub(
    f"{start_marker}.*?{end_marker}",
    new_generated_code,
    obsng_content,
    flags=re.DOTALL
)

# Save the updated file
with open(obsng_js_path, "w") as obsng_file:
    obsng_file.write(obsng_content)



# Determines if a number field is actually an int (otherwise float is used).
# The protocol does not differentiate, but by the names we can have an educated guess.
def is_an_int_field(field_name):
    return (
            field_name.endswith("Id") or
            field_name.endswith("Index") or
            field_name.endswith("Frame") or
            field_name.endswith("Bytes") or
            field_name.endswith("Frames")
    )

# Maps protocol types to Chataigne types.
def determine_type(paramName, paramType):
    if paramType == "Boolean":
        return "Boolean"
    elif paramType == "Number":
        return is_an_int_field(paramName) and "Integer" or "Float"
    elif paramType == "String":
        return "String"
    elif paramType == "Object":
        return "String"
    elif paramType == "Any":
        return "String"
    else:
        return ""


# === Open and parse module.json
with open(module_json_path, "r") as module_file:
    module_data = json.load(module_file)

# === Pre-fill with fixed triggers
module_data["commands"] = {
    "Raw WS Message": {
        "menu": "",
        "callback": "sendRawWSMessage",
        "parameters": {
            "data": {
                "type": "String",
                "default": json.dumps({"op":6,"d":{"requestType":"GetStats","requestId":0,"requestData": {"foo":"bar"}}})
            }
        }
    },
    "Raw OBS Request": {
        "menu": "",
        "callback": "sendRawOBSRequest",
        "parameters": {
            "requestType": {
                "type": "String",
                "default": "GetStats"
            },
            "requestId": {
                "type": "Integer",
                "default": "0"
            },
            "requestData": {
                "type": "String",
                "default": json.dumps({"foo":"bar"})
            }
        }
    },

}


# === Add all "requestType" values as keys in "commands", all of them would call a generic executor with proper values.
for request in protocol_data["requests"]:
    request_type = request.get("requestType")


    if request_type:
        params = {
            "data":{"type":"String","enabled":False},
            "request":{"type":"String","default":request_type,"enabled":False},
            "requestId":{"type":"Integer","default":"0"},
        }
        fieldList = []

        for field in request['requestFields']:
            if field['valueName'].find('.')!=-1:
                # This is because of the weird way the keyboard object is expressed in the official protocol.
                continue

            typeName = determine_type(field["valueName"],field["valueType"])
            if typeName == "":
                continue
            fieldList.append([field['valueName'],field['valueType']])
            paramDef = {
                "type": typeName,
                "description": field['valueOptional'] and "Optional: " or "Required: "+ field['valueDescription']
            }
            params[field['valueName']] = paramDef


        params["data"]["default"] = json.dumps({"fieldList":fieldList})

        module_data["commands"][request_type] = {
            "menu": request['category'].title(),
            "callback": "genericCommandExecutor",
            "parameters": params,
        }

# === Save the updated module.json
with open(module_json_path, "w") as module_file:
    json.dump(module_data, module_file, indent=2)

print("Files updated successfully.")


