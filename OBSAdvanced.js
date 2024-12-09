// ============================================================
// =============== UNSPECIFIED API SPECIFICATION ==============
// ============================================================

// This represents the mapping for all unspecified stuff in OBS's Websocket documentation,
// Basically for all the "Array<Object>"-s in the request/responseFields or events/dataFields, they are undocumented, so they need manual mapping.
//
// KEY: Determines for which input to trigger:
// requests.<request NAME>.<FIELD NAME>
// events.<EVENT NAME>.<FIELD NAME>
//
// VALUE.title: A function that determines the container's title based on the index in the array and the row of data received.
//
// VALUE.columns: An array of arrays: [fieldName, fieldType]
// If fieldType starts with >>> it is a redirect to a different [KEY]
//

var unspecifiedArrayMapping = {
    "requests.GetSceneList.scenes": {
        "title": function (index, row) {
            return "Scene: " + row['sceneUuid'];
        },
        "columns": [
            ["sceneIndex", "Number"],
            ["sceneName", "String"],
            ["sceneUuid", "String"]
        ]
    },
    "requests.GetSceneItemList.sceneItems": {
        "title": function (index, row) {
            return "Item: " + row['sourceUuid'];
        },
        "columns": [
            ["inputKind", "String"],
            ["isGroup", "Boolean"],
            ["sceneItemBlendMode", "String"],
            ["sceneItemEnabled", "Boolean"],
            ["sceneItemId", "Number"],
            ["sceneItemIndex", "Number"],
            ["sceneItemLocked", "Boolean"],
            ["sourceName", "String"],
            ["sourceType", "String"],
            ["sourceUuid", "String"],
            ["sceneItemTransform", ">>>requests.GetSceneItemList.sceneItems.sceneItemTransform"]
        ]
    }, "requests.GetSceneItemList.sceneItems.sceneItemTransform": {
        "title": function (index, row) {
            return "sceneItemTransform";
        },
        "columns": [
            ["alignment", "Number"],
            ["boundsAlignment", "Number"],
            ["boundsHeight", "Number"],
            ["boundsType", "String"],
            ["boundsWidth", "Number"],
            ["cropBottom", "Number"],
            ["cropLeft", "Number"],
            ["cropRight", "Number"],
            ["cropToBounds", "Boolean"],
            ["cropTop", "Number"],
            ["height", "Number"],
            ["positionX", "Number"],
            ["positionY", "Number"],
            ["rotation", "Number"],
            ["scaleX", "Number"],
            ["scaleY", "Number"],
            ["sourceHeight", "Number"],
            ["sourceWidth", "Number"],
            ["width", "Number"]
        ]
    },
    "requests.GetInputList.inputs": {
        "title": function (index, row) {
            return "Input: " + row['inputUuid'];
        },
        "columns": [
            ["inputKind", "String"],
            ["inputName", "String"],
            ["inputUuid", "String"],
            ["unversionedInputKind", "String"]
        ]
    },
    "requests.GetSourceFilterList.filters": {
        "title": function (index, row) {
            return "Filter: " + row['filterIndex'];
        },
        "columns": [
            ["filterEnabled", "Boolean"],
            ["filterIndex", "Number"],
            ["filterKind", "String"],
            ["filterName", "String"],
            ["filterSettings", "JSON"]
        ]
    },
    "requests.GetOutputList.outputs": {
        "title": function (index, row) {
            return "Output: " + row['outputName'];
        },
        "columns": [
            ["outputActive", "Boolean"],
            ["outputHeight", "Number"],
            ["outputWidth", "Number"],
            ["outputKind", "String"],
            ["outputName", "String"],
            ["outputFlags", "JSON"]
        ]
    },
    "requests.GetSceneTransitionList.transitions": {
        "title": function (index, row) {
            return "Transition: " + row['transitionUuid'];
        },
        "columns": [
            ["transitionConfigurable", "Boolean"],
            ["transitionFixed", "Boolean"],
            ["transitionKind", "String"],
            ["transitionName", "String"],
            ["transitionUuid", "String"]
        ]
    },
    "requests.GetMonitorList.monitors": {
        "title": function (index, row) {
            return "Monitor: " + row['monitorIndex'];
        },
        "columns": [
            ["monitorHeight", "Number"],
            ["monitorIndex", "Number"],
            ["monitorName", "String"],
            ["monitorPositionX", "Number"],
            ["monitorPositionY", "Number"],
            ["monitorWidth", "Number"]
        ]
    },
    "events.SourceFilterListReindexed.filters": {
        "title": function (index, row) {
            return "Filter: " + row['filterIndex'];
        },
        "columns": [
            ["filterEnabled", "Boolean"],
            ["filterIndex", "Number"],
            ["filterKind", "String"],
            ["filterName", "String"],
            ["filterSettings", "JSON"]
        ]
    },
    "events.SceneItemListReindexed.sceneItems": {
        "title": function (index, row) {
            return "SceneItem: " + row['sceneItemId'];
        },
        "columns": [
            ["sceneItemId", "Number"],
            ["sceneItemIndex", "Number"],
        ]
    },
    "events.SceneListChanged.scenes": {
        "title": function (index, row) {
            return "SceneItem: " + row['sceneUuid'];
        },
        "columns": [
            ["sceneName", "String"],
            ["sceneIndex", "Number"],
            ["sceneUuid", "Number"],
        ]
    }
    // "requests.GetInputPropertiesListPropertyItems.propertyItems": { // currently not possible to implement }
    // "requests.GetGroupSceneItemList.sceneItems": { // Using groups is discouraged, not implemented. }
};

/**
 * This is a list of requestType.field <-> eventType.field mapping, of whose values can be mapped together.
 * E.g. The request: GetSceneList's "scenes" field is the same as the event SceneListChanged's "scenes" field.
 *
 * This is not really possible to do automatically, so this is a manually created list.
 *
 * Steps to aid creation & check for the future:
 * * Get the list of requests with their responseFields, but only those which have no input parameters and starts with "Get":
 *      jq 'reduce .requests[] as $req ({}; if ($req.requestType | startswith("Get")) and ($req.requestFields | length == 0) then .[$req.requestType] += [$req.responseFields[].valueName] else . end)' protocol.json
 *
 * * Get the list of events with their fields:
 *      jq 'reduce .events[] as $req ({}; .[$req.eventType] += [$req.dataFields[].valueName])' protocol.json
 *
 * * Open this two next toe ach other
 *
 * * Check each request and see if it has a pair event manually...
 *
 *
 * @type {string[][]} List of ["request.field","event.field","merged field name"] mapping.
 * The specified fields will show up under the "Merged" container under the name in the third column.
 * The third column is automatically generated if not specified.
 *
 */
var mergeableRequestsAndEvents = [
    ["GetSceneCollectionList.sceneCollections", "SceneCollectionListChanged.sceneCollections"],
    ["GetProfileList.profiles", "ProfileListChanged.profiles"],
    ["GetSourceFilterList.filters", "SourceFilterListReindexed.filters"],
    ["GetVirtualCamStatus.outputActive", "VirtualcamStateChanged.outputActive"],
    ["GetReplayBufferStatus.outputActive", "ReplayBufferStateChanged.outputActive"],
    ["GetLastReplayBufferReplay.savedReplayPath", "ReplayBufferSaved.savedReplayPath"],
    ["GetRecordStatus.outputActive", "RecordStateChanged.outputActive"],
    ["GetSceneList.scenes", "SceneListChanged.scenes"],
    ["GetSceneList.currentProgramSceneName", "CurrentProgramSceneChanged.sceneName"],
    ["GetSceneList.currentProgramSceneUuid", "CurrentProgramSceneChanged.sceneUuid"],
    ["GetSceneList.currentPreviewSceneName", "CurrentPreviewSceneChanged.sceneName"],
    ["GetSceneList.currentPreviewSceneUuid", "CurrentPreviewSceneChanged.sceneUuid"],
    ["GetCurrentProgramScene.sceneName", "CurrentProgramSceneChanged.sceneName"],
    ["GetCurrentProgramScene.sceneUuid", "CurrentProgramSceneChanged.sceneUuid"],
    ["GetCurrentPreviewScene.sceneName", "CurrentPreviewSceneChanged.sceneName"],
    ["GetCurrentPreviewScene.sceneUuid", "CurrentPreviewSceneChanged.sceneUuid"],
    ["GetStreamStatus.outputActive", "StreamStateChanged.outputActive"],
    ["GetSceneTransitionList.currentSceneTransitionName", "CurrentSceneTransitionChanged.transitionName"],
    ["GetSceneTransitionList.currentSceneTransitionUuid", "CurrentSceneTransitionChanged.transitionUuid"],
    ["GetCurrentSceneTransition.transitionName", "CurrentSceneTransitionChanged.transitionName"],
    ["GetCurrentSceneTransition.transitionUuid", "CurrentSceneTransitionChanged.transitionUuid"],
    ["GetCurrentSceneTransition.transitionDuration", "CurrentSceneTransitionDurationChanged.transitionDuration"],
    ["GetStudioModeEnabled.studioModeEnabled", "StudioModeStateChanged.studioModeEnabled"]
];

// Automatically add a third column: the name for the field in "Merged" (unless it is specified already manually).
for (var i = 0; i < mergeableRequestsAndEvents.length; i++) {
    if (mergeableRequestsAndEvents[i].length == 3) {
        // In case if it is manually overridden.
        continue;
    }
    var entityName = mergeableRequestsAndEvents[i][1].split('.')[0];
    var fieldName = mergeableRequestsAndEvents[i][1].split('.')[1];
    entityName = entityName.replace("Current", "");
    entityName = entityName.replace("Changed", "");
    mergeableRequestsAndEvents[i].push(entityName + "." + fieldName);
}

// ============================================================
// =============== CUSTOM EVENT HANDLERS ======================
// ============================================================

function handleEventInputVolumeMeters(d) {

    for (var i = 0; i < d.eventData.inputs.length; i++) {
        var input = d.eventData.inputs[i];

        var container = getContainer("Events#InputVolumeMeters#" + input.inputName);
        if (input.inputLevelsMul !== undefined) {
            for (var g = 0; g < input.inputLevelsMul.length; g++) {
                var group = input.inputLevelsMul[g];
                var subContainer = getContainer("inputLevelsMul: " + g, container);
                for (var v = 0; v < group.length; v++) {
                    valueFloatParameter(v, group[v], subContainer);
                }
            }
        }
    }
}

// Implementations must be before this line due to the JS engine's quirks.
var customEventHandlers = {"InputVolumeMeters": handleEventInputVolumeMeters};
// ============================================================
// =============== CUSTOM RESPONSE HANDLERS ===================
// ============================================================

// Implementations must be before this line due to the JS engine's quirks.
var customResponseHandlers = {};


// ============================================================
// =============== MODULE METHODS =============================
// ============================================================

/**
 * moduleMethod: Removes all custom containers from the values.
 */
function removeAllValues() {
    local.values.removeContainer("Events");
    local.values.removeContainer("Responses");
    local.values.removeContainer("Merged");
    script.log("All values have been deleted");
}

/*
 moduleMethod: This function will be called each time a value of this module has changed, meaning a parameter or trigger inside the "Values" panel of this module
 This function only exists because the script is in a module
*/
function moduleValueChanged(value) {
    if (value.name == "removeAllValues") {
        removeAllValues();
    }
    if (value.name == "queryAllValues") {
        queryAll();
    }
}

/**
 * moduleMethod: Every time an incoming message is received, we receive it in here.
 * @param message
 */
function wsMessageReceived(message) {
    /* ************************* CONNECTION ******************************** */
    var obsObj = JSON.parse(message);
    var d = obsObj.d;

    if (obsObj.op == 0) {
        var newEventSub = 0; // Start with EventSubscription::None

        // Add event subscriptions based on parameters
        if (local.parameters.eventSub.general.get()) newEventSub += (1 << 0); // EventSubscription::General
        if (local.parameters.eventSub.config.get()) newEventSub += (1 << 1); // EventSubscription::Config
        if (local.parameters.eventSub.scenes.get()) newEventSub += (1 << 2); // EventSubscription::Scenes
        if (local.parameters.eventSub.inputs.get()) newEventSub += (1 << 3); // EventSubscription::Inputs
        if (local.parameters.eventSub.transitions.get()) newEventSub += (1 << 4); // EventSubscription::Transitions
        if (local.parameters.eventSub.filters.get()) newEventSub += (1 << 5); // EventSubscription::Filters
        if (local.parameters.eventSub.outputs.get()) newEventSub += (1 << 6); // EventSubscription::Outputs
        if (local.parameters.eventSub.sceneItems.get()) newEventSub += (1 << 7); // EventSubscription::SceneItems
        if (local.parameters.eventSub.mediaInputs.get()) newEventSub += (1 << 8); // EventSubscription::MediaInputs
        if (local.parameters.eventSub.vendors.get()) newEventSub += (1 << 9); // EventSubscription::Vendors
        if (local.parameters.eventSub.ui.get()) newEventSub += (1 << 10); // EventSubscription::Ui
        if (local.parameters.eventSub.inputVolumeMeters.get()) newEventSub += (1 << 16); // EventSubscription::InputVolumeMeters
        if (local.parameters.eventSub.inputActiveStateChanged.get()) newEventSub += (1 << 17); // EventSubscription::InputActiveStateChanged
        if (local.parameters.eventSub.inputShowStateChanged.get()) newEventSub += (1 << 18); // EventSubscription::InputShowStateChanged
        if (local.parameters.eventSub.sceneItemTransformChanged.get()) newEventSub += (1 << 19); // EventSubscription::SceneItemTransformChanged

        if (d.authentication != null) {
            var mdp = local.parameters.password.get() + d.authentication.salt;
            var Encode1 = util.toBase64(parseHex(util.encodeSHA256(mdp)));
            var Encode2 = util.toBase64(parseHex(util.encodeSHA256(Encode1 + d.authentication.challenge)));
            local.send('{"d":{"authentication": "' + Encode2 + '", "eventSubscriptions": ' + newEventSub + ', "rpcVersion": 1}, "op": 1}');
        } else {
            local.send('{"op": 1,"d": {"rpcVersion": 1,"authentication": "Chataigne","eventSubscriptions": ' + (newEventSub) + '} }');
        }
    } else if (obsObj.op == 2) {
        removeAllValues();
        queryAll();
    }

    if (d.eventType !== undefined) {
        if (customEventHandlers[d.eventType] !== undefined) {
            customEventHandlers[d.eventType](d);
        } else {
            if (!handleEvent(d)) {
                script.log("Event message wasn't handled: " + message);
            }
        }
    }
    if (d.requestType !== undefined) {
        if (customResponseHandlers[d.requestType] !== undefined) {
            customResponseHandlers[d.requestType](d);
        } else {
            if (!handleResponse(d)) {
                script.log("Request message wasn't handled: " + message);
            }
        }
    }

}

// ============================================================
// =============== MODULE COMMAND METHODS======================
// ============================================================

/**
 * Module command method: Sends a raw websocket message
 * @param json
 */
function sendRawWSMessage(json) {
    local.send(json);
}

/**
 * Module command method: Sends an OBS packet through websocket with raw data as input.
 * @param requestType
 * @param requestId
 * @param requestData
 */
function sendRawOBSRequest(requestType, requestId, requestData) {
    sendObsCommand(requestType, JSON.parse(requestData), requestId);
}

/**
 * Module command method: Executes a template command in a generic way based on the generated module.json values.
 * @param data fieldList: [[fieldname,type], ... ]
 * @param requestType the OBS request name
 * @param reqId the request id for OBS
 * @param a 0. parameter (matched to fieldList[0])
 * @param b 1. parameter (matched to fieldList[1])
 * @param c 2. parameter (matched to fieldList[2])
 * @param d ...
 * @param e
 * @param f
 * @param g
 * @param h
 * @param i
 */
function genericCommandExecutor(data, requestType, reqId, a, b, c, d, e, f, g, h, i) {
    var parameters = [a, b, c, d, e, f, g, h, i];
    var data = JSON.parse(data);
    // script.log(data, requestType, reqId, a, b, c, d, e, f, g, h, i);
    var requestData = {};

    for (var i = 0; i < data['fieldList'].length; i++) {
        var value = parameters[i];
        if (["Object", "Array<String>", "Array<Object>"].indexOf(data['fieldList'][i][1]) != -1) {
            value = JSON.parse(value);
        }
        requestData[data['fieldList'][i][0]] = value;
    }

    sendObsCommand(requestType, requestData, reqId);
}


// ============================================================
// =============== UTILITY  METHODS ===========================
// ============================================================

/**
 * Sends a properly formatted websocket package for OBS.
 * @param req
 * @param data
 * @param reqId
 */
function sendObsCommand(req, data, reqId) {
    var send = {};
    var para = {};
    para["requestType"] = req;
    para["requestId"] = reqId;
    para["requestData"] = data;

    /*!== undefined ? data : {}*/
    send["op"] = 6;
    send["d"] = para;

    local.send(JSON.stringify(send));
}

/**
 * Executes all queryes from the API.
 */
function queryAll() {
    // Execute all the requests that start with Get and have no parameters.
    for (var r = 0; r < API.requests.length; r++) {
        var request = API.requests[r];
        var requestType = request.requestType;
        if (requestType.startsWith("Get") && request.requestFields.length == 0) {
            sendObsCommand(request.requestType, {}, r);
        }
    }
}


/**
 * A generic handler for incoming OBS Events.
 * @param d
 * @returns {boolean}
 */
function handleEvent(d) {
    var eventType = d.eventType;

    // Find the event definition in the API.
    var eventDefinition = null;
    for (var i = 0; i < API.events.length; i++) {
        if (API.events[i].eventType == eventType) {
            eventDefinition = API.events[i];
            break;
        }
    }

    if (eventDefinition == null) {
        script.log("Unknown event arrived, that we can't handle: " + eventType);
        return false;
    }


    // Create/get the containers...
    var mergedContainer = getContainer("Merged");
    var eventContainer = getContainer("Events#" + eventType);
    eventContainer.clear();

    // Add parameters
    for (var i = 0; i < eventDefinition.dataFields.length; i++) {
        var fieldDef = eventDefinition.dataFields[i];
        var value = d.eventData[fieldDef.valueName];
        if (fieldDef.valueType == "Array<Object>") {
            renderArray("events." + eventType + "." + fieldDef.valueName, value, eventContainer);
        } else {
            addParameter(fieldDef.valueName, value, fieldDef.valueType, eventContainer, fieldDef.valueDescription);
        }
        // Look for merged fields and do the same...
        for (var m = 0; m < mergeableRequestsAndEvents.length; m++) {
            if (mergeableRequestsAndEvents[m][1] == eventType + "." + fieldDef.valueName) {
                var labelParts = mergeableRequestsAndEvents[m][2].split('.');
                var containerLabel = labelParts[0];
                var fieldLabel = labelParts[1];
                var subContainer = getContainer(containerLabel, mergedContainer);
                if (fieldDef.valueType == "Array<Object>") {
                    renderArray("events." + eventType + "." + fieldDef.valueName, value, subContainer);
                } else {
                    addParameter(fieldLabel, value, fieldDef.valueType, subContainer, fieldDef.valueDescription);
                }
            }
        }

    }

    return true;
}


/**
 * A generic handler for incoming OBS Events.
 * @param d
 * @returns {boolean}
 */
function handleResponse(d) {
    var requestType = d.requestType;
    var requestDefinition = null;

    // Find the request definition in the API.
    for (var i = 0; i < API.requests.length; i++) {
        if (API.requests[i].requestType == requestType) {
            requestDefinition = API.requests[i];
            break;
        }
    }

    if (requestDefinition == null) {
        script.log("Unknown response arrived, that we can't handle: " + requestType);
        return false;
    }

    // Create/get containers ...
    var mergedContainer = getContainer("Merged");
    var responseContainer = getContainer("Responses#" + requestType);
    responseContainer.clear();

    addParameter("requestId", d.requestId, "Number", responseContainer, "");
    // Add parameters
    for (var i = 0; i < requestDefinition.responseFields.length; i++) {
        var fieldDef = requestDefinition.responseFields[i];
        var value = d.responseData[fieldDef.valueName];
        if (fieldDef.valueType == "Array<Object>") {
            renderArray("requests." + requestType + "." + fieldDef.valueName, value, responseContainer);
        } else {
            addParameter(fieldDef.valueName, value, fieldDef.valueType, responseContainer, fieldDef.valueDescription);

        }
        // Look for merged fields
        for (var m = 0; m < mergeableRequestsAndEvents.length; m++) {
            if (mergeableRequestsAndEvents[m][0] == requestType + "." + fieldDef.valueName) {
                var labelParts = mergeableRequestsAndEvents[m][2].split('.');
                var containerLabel = labelParts[0];
                var fieldLabel = labelParts[1];
                var subContainer = getContainer(containerLabel, mergedContainer);
                if (fieldDef.valueType == "Array<Object>") {
                    renderArray("requests." + requestType + "." + fieldDef.valueName, value, subContainer);
                } else {
                    addParameter(fieldLabel, value, fieldDef.valueType, subContainer, fieldDef.valueDescription);
                }
            }
        }

    }

    return true;
}

/**
 * Renders the parts of the API that are unspecified. This works based on a manual mapping [unspecifiedArrayMapping] on top of this file.
 * Learn more about it's structure there.
 *
 * @param APISection
 * @param rows
 * @param container
 */
function renderArray(APISection, rows, container) {
    // script.log("Processing:" + JSON.stringify([APISection, rows]));

    var mapping = unspecifiedArrayMapping[APISection];
    if (mapping == undefined) {
        script.log("Found no unspecifiedArrayMapping definition for: " + APISection);
        return;
    }

    // Iterate on all the "unknown" rows
    for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        var rowCont = getContainer(mapping.title(r, row), container);

        for (var c = 0; c < mapping.columns.length; c++) {
            var columnName = mapping.columns[c][0];
            var columnType = mapping.columns[c][1];

            if (columnType.startsWith(">>>")) {
                // If the type starts with >>> that's a redirect to render it based on a different specification.
                renderArray(columnType.replace(">>>", ""), [row[columnName]], rowCont);
            } else {
                addParameter(columnName, row[columnName], columnType, rowCont, "");
            }
        }
    }
}

/**
 * A helper for adding parameters, distinguihing their types, and setting properties.
 * @param name The name of the property
 * @param value The value of the property
 * @param valueType The type (Number, Boolean, String, Any, Arrray<String>, JSON).
 * @param container
 * @param description
 */
function addParameter(name, value, valueType, container, description) {
    if (valueType == "Number") {
        if (isAnIntField(name)) {
            valueIntParameter(name, value, container, description);
        } else {
            valueFloatParameter(name, value, container, description);
        }
    } else if (valueType == "Boolean") {
        valueBoolParameter(name, value, container, description);
    } else if (valueType == "String") {
        valueStringParameter(name, value, container, description);
    } else if (valueType == "Array<String>") {
        var subContainer = getContainer(name + " list", container);
        subContainer.clear();
        valueStringParameter(name, value.join(';'), container, description);
        for (var i = 0; i < value.length; i++) {
            valueStringParameter(i, value[i], subContainer, description);
        }
    } else if (valueType == "Any") {
        valueStringParameter(name, value, container, description);
    } else if (valueType == "JSON") {
        valueStringParameter(name, JSON.stringify(value), container, description);
    } else {
        script.log("Unknown field type: " + valueType + " for name: " + name + " in: " + container.name + " value:" + value);
    }
}

/**
 * The API only specifies "Number", but we have Integer and Float as well.
 * We assume Float if we are not sure, but for a few we can guess from the name that they are Integers.
 *
 * @param fieldName
 * @returns {boolean}
 */
function isAnIntField(fieldName) {
    return fieldName.endsWith("Id")
        || fieldName.endsWith("Index")
        || fieldName.endsWith("Frame")
        || fieldName.endsWith("Bytes")
        || fieldName.endsWith("Frames");
}

/**
 * Parses a hex string
 * @param str
 * @returns {*[]}
 */
function parseHex(str) {
    var result = [];
    for (var i = 0; i < str.length; i += 2) {
        var n = parseInt("0x" + str.substring(i, i + 2));
        result.push(n);
    }
    return result;
}

/**
 * Adds a boolean parameter
 * @param value
 * @param data
 * @param root The container to add the parameter to. Optional.
 * @param description
 */
function valueBoolParameter(value, data, root, description) {
    if (root == undefined) {
        root = local.values;
    }
    if (description == undefined) {
        description = "";
    }
    if (root.getChild(value) == null) {
        root.addBoolParameter(value, description, data);
        root.getChild(value).setAttribute("readonly", true);
    } else {
        root.getChild(value).set(data);
    }
}

/**
 * Adds a string parameter
 * @param value
 * @param data
 * @param root The container to add the parameter to. Optional.
 * @param description
 */
function valueStringParameter(value, data, root, description) {
    if (root == undefined) {
        root = local.values;
    }
    if (description == undefined) {
        description = "";
    }
    if (root.getChild(value) == null) {
        root.addStringParameter(value, description, data);
        root.getChild(value).setAttribute("readonly", true);
    } else {
        root.getChild(value).set(data);
    }
}

/**
 * Adds a float parameter
 * @param value
 * @param data
 * @param root The container to add the parameter to. Optional.
 * @param description
 */
function valueFloatParameter(value, data, root, description) {
    if (root == undefined) {
        root = local.values;
    }
    if (description == undefined) {
        description = "";
    }
    if (root.getChild(value) == null) {
        root.addFloatParameter(value, description, data);
        root.getChild(value).setAttribute("readonly", true);
    } else {
        root.getChild(value).set(data);
    }
}

/**
 * Adds an int parameter
 * @param value
 * @param data
 * @param root The container to add the parameter to. Optional.
 * @param description
 */
function valueIntParameter(value, data, root, description) {
    if (root == undefined) {
        root = local.values;
    }
    if (description == undefined) {
        description = "";
    }
    if (root.getChild(value) == null) {
        root.addIntParameter(value, description, data);
        root.getChild(value).setAttribute("readonly", true);
    } else {
        root.getChild(value).set(data);
    }
}

/**
 * Creates nested containers and returns the inner-most one.
 *
 * @param path # separated list of hierarchy you want, e.g.: #Main#Sub#Sub2
 * @param root (optional) the root container: Where to start adding the sub containers.
 */
function getContainer(path, root) {
    var pathParts = path.split("#");

    if (root == undefined) {
        root = local.values;
    }

    for (var i = 0; i < pathParts.length; i++) {
        var pathPart = pathParts[i];
        root.addContainer(pathPart);
        root = root.getChild(pathPart);
    }
    return root;
}


// Automatically generated, copied from https://raw.githubusercontent.com/obsproject/obs-websocket/refs/heads/master/docs/generated/protocol.json
// <GENERATED-CODE-API>
var API = {
  "enums": [
    {
      "enumType": "EventSubscription",
      "enumIdentifiers": [
        {
          "description": "Subcription value used to disable all events.",
          "enumIdentifier": "None",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 0
        },
        {
          "description": "Subscription value to receive events in the `General` category.",
          "enumIdentifier": "General",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 0)"
        },
        {
          "description": "Subscription value to receive events in the `Config` category.",
          "enumIdentifier": "Config",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 1)"
        },
        {
          "description": "Subscription value to receive events in the `Scenes` category.",
          "enumIdentifier": "Scenes",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 2)"
        },
        {
          "description": "Subscription value to receive events in the `Inputs` category.",
          "enumIdentifier": "Inputs",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 3)"
        },
        {
          "description": "Subscription value to receive events in the `Transitions` category.",
          "enumIdentifier": "Transitions",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 4)"
        },
        {
          "description": "Subscription value to receive events in the `Filters` category.",
          "enumIdentifier": "Filters",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 5)"
        },
        {
          "description": "Subscription value to receive events in the `Outputs` category.",
          "enumIdentifier": "Outputs",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 6)"
        },
        {
          "description": "Subscription value to receive events in the `SceneItems` category.",
          "enumIdentifier": "SceneItems",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 7)"
        },
        {
          "description": "Subscription value to receive events in the `MediaInputs` category.",
          "enumIdentifier": "MediaInputs",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 8)"
        },
        {
          "description": "Subscription value to receive the `VendorEvent` event.",
          "enumIdentifier": "Vendors",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 9)"
        },
        {
          "description": "Subscription value to receive events in the `Ui` category.",
          "enumIdentifier": "Ui",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 10)"
        },
        {
          "description": "Helper to receive all non-high-volume events.",
          "enumIdentifier": "All",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(General | Config | Scenes | Inputs | Transitions | Filters | Outputs | SceneItems | MediaInputs | Vendors | Ui)"
        },
        {
          "description": "Subscription value to receive the `InputVolumeMeters` high-volume event.",
          "enumIdentifier": "InputVolumeMeters",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 16)"
        },
        {
          "description": "Subscription value to receive the `InputActiveStateChanged` high-volume event.",
          "enumIdentifier": "InputActiveStateChanged",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 17)"
        },
        {
          "description": "Subscription value to receive the `InputShowStateChanged` high-volume event.",
          "enumIdentifier": "InputShowStateChanged",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 18)"
        },
        {
          "description": "Subscription value to receive the `SceneItemTransformChanged` high-volume event.",
          "enumIdentifier": "SceneItemTransformChanged",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "(1 << 19)"
        }
      ]
    },
    {
      "enumType": "RequestBatchExecutionType",
      "enumIdentifiers": [
        {
          "description": "Not a request batch.",
          "enumIdentifier": "None",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "-1"
        },
        {
          "description": "A request batch which processes all requests serially, as fast as possible.\n\nNote: To introduce artificial delay, use the `Sleep` request and the `sleepMillis` request field.",
          "enumIdentifier": "SerialRealtime",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 0
        },
        {
          "description": "A request batch type which processes all requests serially, in sync with the graphics thread. Designed to provide high accuracy for animations.\n\nNote: To introduce artificial delay, use the `Sleep` request and the `sleepFrames` request field.",
          "enumIdentifier": "SerialFrame",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 1
        },
        {
          "description": "A request batch type which processes all requests using all available threads in the thread pool.\n\nNote: This is mainly experimental, and only really shows its colors during requests which require lots of\nactive processing, like `GetSourceScreenshot`.",
          "enumIdentifier": "Parallel",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 2
        }
      ]
    },
    {
      "enumType": "RequestStatus",
      "enumIdentifiers": [
        {
          "description": "Unknown status, should never be used.",
          "enumIdentifier": "Unknown",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 0
        },
        {
          "description": "For internal use to signify a successful field check.",
          "enumIdentifier": "NoError",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 10
        },
        {
          "description": "The request has succeeded.",
          "enumIdentifier": "Success",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 100
        },
        {
          "description": "The `requestType` field is missing from the request data.",
          "enumIdentifier": "MissingRequestType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 203
        },
        {
          "description": "The request type is invalid or does not exist.",
          "enumIdentifier": "UnknownRequestType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 204
        },
        {
          "description": "Generic error code.\n\nNote: A comment is required to be provided by obs-websocket.",
          "enumIdentifier": "GenericError",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 205
        },
        {
          "description": "The request batch execution type is not supported.",
          "enumIdentifier": "UnsupportedRequestBatchExecutionType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 206
        },
        {
          "description": "The server is not ready to handle the request.\n\nNote: This usually occurs during OBS scene collection change or exit. Requests may be tried again after a delay if this code is given.",
          "enumIdentifier": "NotReady",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.3.0",
          "enumValue": 207
        },
        {
          "description": "A required request field is missing.",
          "enumIdentifier": "MissingRequestField",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 300
        },
        {
          "description": "The request does not have a valid requestData object.",
          "enumIdentifier": "MissingRequestData",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 301
        },
        {
          "description": "Generic invalid request field message.\n\nNote: A comment is required to be provided by obs-websocket.",
          "enumIdentifier": "InvalidRequestField",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 400
        },
        {
          "description": "A request field has the wrong data type.",
          "enumIdentifier": "InvalidRequestFieldType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 401
        },
        {
          "description": "A request field (number) is outside of the allowed range.",
          "enumIdentifier": "RequestFieldOutOfRange",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 402
        },
        {
          "description": "A request field (string or array) is empty and cannot be.",
          "enumIdentifier": "RequestFieldEmpty",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 403
        },
        {
          "description": "There are too many request fields (eg. a request takes two optionals, where only one is allowed at a time).",
          "enumIdentifier": "TooManyRequestFields",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 404
        },
        {
          "description": "An output is running and cannot be in order to perform the request.",
          "enumIdentifier": "OutputRunning",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 500
        },
        {
          "description": "An output is not running and should be.",
          "enumIdentifier": "OutputNotRunning",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 501
        },
        {
          "description": "An output is paused and should not be.",
          "enumIdentifier": "OutputPaused",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 502
        },
        {
          "description": "An output is not paused and should be.",
          "enumIdentifier": "OutputNotPaused",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 503
        },
        {
          "description": "An output is disabled and should not be.",
          "enumIdentifier": "OutputDisabled",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 504
        },
        {
          "description": "Studio mode is active and cannot be.",
          "enumIdentifier": "StudioModeActive",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 505
        },
        {
          "description": "Studio mode is not active and should be.",
          "enumIdentifier": "StudioModeNotActive",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 506
        },
        {
          "description": "The resource was not found.\n\nNote: Resources are any kind of object in obs-websocket, like inputs, profiles, outputs, etc.",
          "enumIdentifier": "ResourceNotFound",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 600
        },
        {
          "description": "The resource already exists.",
          "enumIdentifier": "ResourceAlreadyExists",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 601
        },
        {
          "description": "The type of resource found is invalid.",
          "enumIdentifier": "InvalidResourceType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 602
        },
        {
          "description": "There are not enough instances of the resource in order to perform the request.",
          "enumIdentifier": "NotEnoughResources",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 603
        },
        {
          "description": "The state of the resource is invalid. For example, if the resource is blocked from being accessed.",
          "enumIdentifier": "InvalidResourceState",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 604
        },
        {
          "description": "The specified input (obs_source_t-OBS_SOURCE_TYPE_INPUT) had the wrong kind.",
          "enumIdentifier": "InvalidInputKind",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 605
        },
        {
          "description": "The resource does not support being configured.\n\nThis is particularly relevant to transitions, where they do not always have changeable settings.",
          "enumIdentifier": "ResourceNotConfigurable",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 606
        },
        {
          "description": "The specified filter (obs_source_t-OBS_SOURCE_TYPE_FILTER) had the wrong kind.",
          "enumIdentifier": "InvalidFilterKind",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 607
        },
        {
          "description": "Creating the resource failed.",
          "enumIdentifier": "ResourceCreationFailed",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 700
        },
        {
          "description": "Performing an action on the resource failed.",
          "enumIdentifier": "ResourceActionFailed",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 701
        },
        {
          "description": "Processing the request failed unexpectedly.\n\nNote: A comment is required to be provided by obs-websocket.",
          "enumIdentifier": "RequestProcessingFailed",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 702
        },
        {
          "description": "The combination of request fields cannot be used to perform an action.",
          "enumIdentifier": "CannotAct",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 703
        }
      ]
    },
    {
      "enumType": "ObsOutputState",
      "enumIdentifiers": [
        {
          "description": "Unknown state.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_UNKNOWN",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_UNKNOWN"
        },
        {
          "description": "The output is starting.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_STARTING",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_STARTING"
        },
        {
          "description": "The input has started.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_STARTED",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_STARTED"
        },
        {
          "description": "The output is stopping.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_STOPPING",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_STOPPING"
        },
        {
          "description": "The output has stopped.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_STOPPED",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_STOPPED"
        },
        {
          "description": "The output has disconnected and is reconnecting.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_RECONNECTING",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_RECONNECTING"
        },
        {
          "description": "The output has reconnected successfully.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_RECONNECTED",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.1.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_RECONNECTED"
        },
        {
          "description": "The output is now paused.",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_PAUSED",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.1.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_PAUSED"
        },
        {
          "description": "The output has been resumed (unpaused).",
          "enumIdentifier": "OBS_WEBSOCKET_OUTPUT_RESUMED",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_OUTPUT_RESUMED"
        }
      ]
    },
    {
      "enumType": "ObsMediaInputAction",
      "enumIdentifiers": [
        {
          "description": "No action.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NONE",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NONE"
        },
        {
          "description": "Play the media input.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PLAY"
        },
        {
          "description": "Pause the media input.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PAUSE"
        },
        {
          "description": "Stop the media input.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP"
        },
        {
          "description": "Restart the media input.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART"
        },
        {
          "description": "Go to the next playlist item.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_NEXT"
        },
        {
          "description": "Go to the previous playlist item.",
          "enumIdentifier": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": "OBS_WEBSOCKET_MEDIA_INPUT_ACTION_PREVIOUS"
        }
      ]
    },
    {
      "enumType": "WebSocketCloseCode",
      "enumIdentifiers": [
        {
          "description": "For internal use only to tell the request handler not to perform any close action.",
          "enumIdentifier": "DontClose",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 0
        },
        {
          "description": "Unknown reason, should never be used.",
          "enumIdentifier": "UnknownReason",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4000
        },
        {
          "description": "The server was unable to decode the incoming websocket message.",
          "enumIdentifier": "MessageDecodeError",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4002
        },
        {
          "description": "A data field is required but missing from the payload.",
          "enumIdentifier": "MissingDataField",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4003
        },
        {
          "description": "A data field's value type is invalid.",
          "enumIdentifier": "InvalidDataFieldType",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4004
        },
        {
          "description": "A data field's value is invalid.",
          "enumIdentifier": "InvalidDataFieldValue",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4005
        },
        {
          "description": "The specified `op` was invalid or missing.",
          "enumIdentifier": "UnknownOpCode",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4006
        },
        {
          "description": "The client sent a websocket message without first sending `Identify` message.",
          "enumIdentifier": "NotIdentified",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4007
        },
        {
          "description": "The client sent an `Identify` message while already identified.\n\nNote: Once a client has identified, only `Reidentify` may be used to change session parameters.",
          "enumIdentifier": "AlreadyIdentified",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4008
        },
        {
          "description": "The authentication attempt (via `Identify`) failed.",
          "enumIdentifier": "AuthenticationFailed",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4009
        },
        {
          "description": "The server detected the usage of an old version of the obs-websocket RPC protocol.",
          "enumIdentifier": "UnsupportedRpcVersion",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4010
        },
        {
          "description": "The websocket session has been invalidated by the obs-websocket server.\n\nNote: This is the code used by the `Kick` button in the UI Session List. If you receive this code, you must not automatically reconnect.",
          "enumIdentifier": "SessionInvalidated",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4011
        },
        {
          "description": "A requested feature is not supported due to hardware/software limitations.",
          "enumIdentifier": "UnsupportedFeature",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 4012
        }
      ]
    },
    {
      "enumType": "WebSocketOpCode",
      "enumIdentifiers": [
        {
          "description": "The initial message sent by obs-websocket to newly connected clients.",
          "enumIdentifier": "Hello",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 0
        },
        {
          "description": "The message sent by a newly connected client to obs-websocket in response to a `Hello`.",
          "enumIdentifier": "Identify",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 1
        },
        {
          "description": "The response sent by obs-websocket to a client after it has successfully identified with obs-websocket.",
          "enumIdentifier": "Identified",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 2
        },
        {
          "description": "The message sent by an already-identified client to update identification parameters.",
          "enumIdentifier": "Reidentify",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 3
        },
        {
          "description": "The message sent by obs-websocket containing an event payload.",
          "enumIdentifier": "Event",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 5
        },
        {
          "description": "The message sent by a client to obs-websocket to perform a request.",
          "enumIdentifier": "Request",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 6
        },
        {
          "description": "The message sent by obs-websocket in response to a particular request from a client.",
          "enumIdentifier": "RequestResponse",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 7
        },
        {
          "description": "The message sent by a client to obs-websocket to perform a batch of requests.",
          "enumIdentifier": "RequestBatch",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 8
        },
        {
          "description": "The message sent by obs-websocket in response to a particular batch of requests from a client.",
          "enumIdentifier": "RequestBatchResponse",
          "rpcVersion": "1",
          "deprecated": false,
          "initialVersion": "5.0.0",
          "enumValue": 9
        }
      ]
    }
  ],
  "requests": [
    {
      "description": "Gets the value of a \"slot\" from the selected persistent data realm.",
      "requestType": "GetPersistentData",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "realm",
          "valueType": "String",
          "valueDescription": "The data realm to select. `OBS_WEBSOCKET_DATA_REALM_GLOBAL` or `OBS_WEBSOCKET_DATA_REALM_PROFILE`",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "slotName",
          "valueType": "String",
          "valueDescription": "The name of the slot to retrieve data from",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "slotValue",
          "valueType": "Any",
          "valueDescription": "Value associated with the slot. `null` if not set"
        }
      ]
    },
    {
      "description": "Sets the value of a \"slot\" from the selected persistent data realm.",
      "requestType": "SetPersistentData",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "realm",
          "valueType": "String",
          "valueDescription": "The data realm to select. `OBS_WEBSOCKET_DATA_REALM_GLOBAL` or `OBS_WEBSOCKET_DATA_REALM_PROFILE`",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "slotName",
          "valueType": "String",
          "valueDescription": "The name of the slot to retrieve data from",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "slotValue",
          "valueType": "Any",
          "valueDescription": "The value to apply to the slot",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all scene collections",
      "requestType": "GetSceneCollectionList",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "currentSceneCollectionName",
          "valueType": "String",
          "valueDescription": "The name of the current scene collection"
        },
        {
          "valueName": "sceneCollections",
          "valueType": "Array<String>",
          "valueDescription": "Array of all available scene collections"
        }
      ]
    },
    {
      "description": "Switches to a scene collection.\n\nNote: This will block until the collection has finished changing.",
      "requestType": "SetCurrentSceneCollection",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "sceneCollectionName",
          "valueType": "String",
          "valueDescription": "Name of the scene collection to switch to",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Creates a new scene collection, switching to it in the process.\n\nNote: This will block until the collection has finished changing.",
      "requestType": "CreateSceneCollection",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "sceneCollectionName",
          "valueType": "String",
          "valueDescription": "Name for the new scene collection",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all profiles",
      "requestType": "GetProfileList",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "currentProfileName",
          "valueType": "String",
          "valueDescription": "The name of the current profile"
        },
        {
          "valueName": "profiles",
          "valueType": "Array<String>",
          "valueDescription": "Array of all available profiles"
        }
      ]
    },
    {
      "description": "Switches to a profile.",
      "requestType": "SetCurrentProfile",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "profileName",
          "valueType": "String",
          "valueDescription": "Name of the profile to switch to",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Creates a new profile, switching to it in the process",
      "requestType": "CreateProfile",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "profileName",
          "valueType": "String",
          "valueDescription": "Name for the new profile",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Removes a profile. If the current profile is chosen, it will change to a different profile first.",
      "requestType": "RemoveProfile",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "profileName",
          "valueType": "String",
          "valueDescription": "Name of the profile to remove",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets a parameter from the current profile's configuration.",
      "requestType": "GetProfileParameter",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "parameterCategory",
          "valueType": "String",
          "valueDescription": "Category of the parameter to get",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "parameterName",
          "valueType": "String",
          "valueDescription": "Name of the parameter to get",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "parameterValue",
          "valueType": "String",
          "valueDescription": "Value associated with the parameter. `null` if not set and no default"
        },
        {
          "valueName": "defaultParameterValue",
          "valueType": "String",
          "valueDescription": "Default value associated with the parameter. `null` if no default"
        }
      ]
    },
    {
      "description": "Sets the value of a parameter in the current profile's configuration.",
      "requestType": "SetProfileParameter",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "parameterCategory",
          "valueType": "String",
          "valueDescription": "Category of the parameter to set",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "parameterName",
          "valueType": "String",
          "valueDescription": "Name of the parameter to set",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "parameterValue",
          "valueType": "String",
          "valueDescription": "Value of the parameter to set. Use `null` to delete",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the current video settings.\n\nNote: To get the true FPS value, divide the FPS numerator by the FPS denominator. Example: `60000/1001`",
      "requestType": "GetVideoSettings",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "fpsNumerator",
          "valueType": "Number",
          "valueDescription": "Numerator of the fractional FPS value"
        },
        {
          "valueName": "fpsDenominator",
          "valueType": "Number",
          "valueDescription": "Denominator of the fractional FPS value"
        },
        {
          "valueName": "baseWidth",
          "valueType": "Number",
          "valueDescription": "Width of the base (canvas) resolution in pixels"
        },
        {
          "valueName": "baseHeight",
          "valueType": "Number",
          "valueDescription": "Height of the base (canvas) resolution in pixels"
        },
        {
          "valueName": "outputWidth",
          "valueType": "Number",
          "valueDescription": "Width of the output resolution in pixels"
        },
        {
          "valueName": "outputHeight",
          "valueType": "Number",
          "valueDescription": "Height of the output resolution in pixels"
        }
      ]
    },
    {
      "description": "Sets the current video settings.\n\nNote: Fields must be specified in pairs. For example, you cannot set only `baseWidth` without needing to specify `baseHeight`.",
      "requestType": "SetVideoSettings",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "fpsNumerator",
          "valueType": "Number",
          "valueDescription": "Numerator of the fractional FPS value",
          "valueRestrictions": ">= 1",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        },
        {
          "valueName": "fpsDenominator",
          "valueType": "Number",
          "valueDescription": "Denominator of the fractional FPS value",
          "valueRestrictions": ">= 1",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        },
        {
          "valueName": "baseWidth",
          "valueType": "Number",
          "valueDescription": "Width of the base (canvas) resolution in pixels",
          "valueRestrictions": ">= 1, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        },
        {
          "valueName": "baseHeight",
          "valueType": "Number",
          "valueDescription": "Height of the base (canvas) resolution in pixels",
          "valueRestrictions": ">= 1, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        },
        {
          "valueName": "outputWidth",
          "valueType": "Number",
          "valueDescription": "Width of the output resolution in pixels",
          "valueRestrictions": ">= 1, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        },
        {
          "valueName": "outputHeight",
          "valueType": "Number",
          "valueDescription": "Height of the output resolution in pixels",
          "valueRestrictions": ">= 1, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Not changed"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the current stream service settings (stream destination).",
      "requestType": "GetStreamServiceSettings",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "streamServiceType",
          "valueType": "String",
          "valueDescription": "Stream service type, like `rtmp_custom` or `rtmp_common`"
        },
        {
          "valueName": "streamServiceSettings",
          "valueType": "Object",
          "valueDescription": "Stream service settings"
        }
      ]
    },
    {
      "description": "Sets the current stream service settings (stream destination).\n\nNote: Simple RTMP settings can be set with type `rtmp_custom` and the settings fields `server` and `key`.",
      "requestType": "SetStreamServiceSettings",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "streamServiceType",
          "valueType": "String",
          "valueDescription": "Type of stream service to apply. Example: `rtmp_common` or `rtmp_custom`",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "streamServiceSettings",
          "valueType": "Object",
          "valueDescription": "Settings to apply to the service",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the current directory that the record output is set to.",
      "requestType": "GetRecordDirectory",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "recordDirectory",
          "valueType": "String",
          "valueDescription": "Output directory"
        }
      ]
    },
    {
      "description": "Sets the current directory that the record output writes files to.",
      "requestType": "SetRecordDirectory",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.3.0",
      "category": "config",
      "requestFields": [
        {
          "valueName": "recordDirectory",
          "valueType": "String",
          "valueDescription": "Output directory",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all available source filter kinds.\n\nSimilar to `GetInputKindList`",
      "requestType": "GetSourceFilterKindList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.4.0",
      "category": "filters",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "sourceFilterKinds",
          "valueType": "Array<String>",
          "valueDescription": "Array of source filter kinds"
        }
      ]
    },
    {
      "description": "Gets an array of all of a source's filters.",
      "requestType": "GetSourceFilterList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "filters",
          "valueType": "Array<Object>",
          "valueDescription": "Array of filters"
        }
      ]
    },
    {
      "description": "Gets the default settings for a filter kind.",
      "requestType": "GetSourceFilterDefaultSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "filterKind",
          "valueType": "String",
          "valueDescription": "Filter kind to get the default settings for",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "defaultFilterSettings",
          "valueType": "Object",
          "valueDescription": "Object of default settings for the filter kind"
        }
      ]
    },
    {
      "description": "Creates a new filter, adding it to the specified source.",
      "requestType": "CreateSourceFilter",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to add the filter to",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to add the filter to",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the new filter to be created",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "filterKind",
          "valueType": "String",
          "valueDescription": "The kind of filter to be created",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "filterSettings",
          "valueType": "Object",
          "valueDescription": "Settings object to initialize the filter with",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Default settings used"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Removes a filter from a source.",
      "requestType": "RemoveSourceFilter",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter to remove",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the name of a source filter (rename).",
      "requestType": "SetSourceFilterName",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Current name of the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "newFilterName",
          "valueType": "String",
          "valueDescription": "New name for the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the info for a specific source filter.",
      "requestType": "GetSourceFilter",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "filterEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether the filter is enabled"
        },
        {
          "valueName": "filterIndex",
          "valueType": "Number",
          "valueDescription": "Index of the filter in the list, beginning at 0"
        },
        {
          "valueName": "filterKind",
          "valueType": "String",
          "valueDescription": "The kind of filter"
        },
        {
          "valueName": "filterSettings",
          "valueType": "Object",
          "valueDescription": "Settings object associated with the filter"
        }
      ]
    },
    {
      "description": "Sets the index position of a filter on a source.",
      "requestType": "SetSourceFilterIndex",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "filterIndex",
          "valueType": "Number",
          "valueDescription": "New index position of the filter",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the settings of a source filter.",
      "requestType": "SetSourceFilterSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter to set the settings of",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "filterSettings",
          "valueType": "Object",
          "valueDescription": "Object of settings to apply",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "overlay",
          "valueType": "Boolean",
          "valueDescription": "True == apply the settings on top of existing ones, False == reset the input to its defaults, then apply settings.",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "true"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the enable state of a source filter.",
      "requestType": "SetSourceFilterEnabled",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source the filter is on",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "filterEnabled",
          "valueType": "Boolean",
          "valueDescription": "New enable state of the filter",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets data about the current plugin and RPC version.",
      "requestType": "GetVersion",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "obsVersion",
          "valueType": "String",
          "valueDescription": "Current OBS Studio version"
        },
        {
          "valueName": "obsWebSocketVersion",
          "valueType": "String",
          "valueDescription": "Current obs-websocket version"
        },
        {
          "valueName": "rpcVersion",
          "valueType": "Number",
          "valueDescription": "Current latest obs-websocket RPC version"
        },
        {
          "valueName": "availableRequests",
          "valueType": "Array<String>",
          "valueDescription": "Array of available RPC requests for the currently negotiated RPC version"
        },
        {
          "valueName": "supportedImageFormats",
          "valueType": "Array<String>",
          "valueDescription": "Image formats available in `GetSourceScreenshot` and `SaveSourceScreenshot` requests."
        },
        {
          "valueName": "platform",
          "valueType": "String",
          "valueDescription": "Name of the platform. Usually `windows`, `macos`, or `ubuntu` (linux flavor). Not guaranteed to be any of those"
        },
        {
          "valueName": "platformDescription",
          "valueType": "String",
          "valueDescription": "Description of the platform, like `Windows 10 (10.0)`"
        }
      ]
    },
    {
      "description": "Gets statistics about OBS, obs-websocket, and the current session.",
      "requestType": "GetStats",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "cpuUsage",
          "valueType": "Number",
          "valueDescription": "Current CPU usage in percent"
        },
        {
          "valueName": "memoryUsage",
          "valueType": "Number",
          "valueDescription": "Amount of memory in MB currently being used by OBS"
        },
        {
          "valueName": "availableDiskSpace",
          "valueType": "Number",
          "valueDescription": "Available disk space on the device being used for recording storage"
        },
        {
          "valueName": "activeFps",
          "valueType": "Number",
          "valueDescription": "Current FPS being rendered"
        },
        {
          "valueName": "averageFrameRenderTime",
          "valueType": "Number",
          "valueDescription": "Average time in milliseconds that OBS is taking to render a frame"
        },
        {
          "valueName": "renderSkippedFrames",
          "valueType": "Number",
          "valueDescription": "Number of frames skipped by OBS in the render thread"
        },
        {
          "valueName": "renderTotalFrames",
          "valueType": "Number",
          "valueDescription": "Total number of frames outputted by the render thread"
        },
        {
          "valueName": "outputSkippedFrames",
          "valueType": "Number",
          "valueDescription": "Number of frames skipped by OBS in the output thread"
        },
        {
          "valueName": "outputTotalFrames",
          "valueType": "Number",
          "valueDescription": "Total number of frames outputted by the output thread"
        },
        {
          "valueName": "webSocketSessionIncomingMessages",
          "valueType": "Number",
          "valueDescription": "Total number of messages received by obs-websocket from the client"
        },
        {
          "valueName": "webSocketSessionOutgoingMessages",
          "valueType": "Number",
          "valueDescription": "Total number of messages sent by obs-websocket to the client"
        }
      ]
    },
    {
      "description": "Broadcasts a `CustomEvent` to all WebSocket clients. Receivers are clients which are identified and subscribed.",
      "requestType": "BroadcastCustomEvent",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [
        {
          "valueName": "eventData",
          "valueType": "Object",
          "valueDescription": "Data payload to emit to all receivers",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Call a request registered to a vendor.\n\nA vendor is a unique name registered by a third-party plugin or script, which allows for custom requests and events to be added to obs-websocket.\nIf a plugin or script implements vendor requests or events, documentation is expected to be provided with them.",
      "requestType": "CallVendorRequest",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [
        {
          "valueName": "vendorName",
          "valueType": "String",
          "valueDescription": "Name of the vendor to use",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "requestType",
          "valueType": "String",
          "valueDescription": "The request type to call",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "requestData",
          "valueType": "Object",
          "valueDescription": "Object containing appropriate request data",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "{}"
        }
      ],
      "responseFields": [
        {
          "valueName": "vendorName",
          "valueType": "String",
          "valueDescription": "Echoed of `vendorName`"
        },
        {
          "valueName": "requestType",
          "valueType": "String",
          "valueDescription": "Echoed of `requestType`"
        },
        {
          "valueName": "responseData",
          "valueType": "Object",
          "valueDescription": "Object containing appropriate response data. {} if request does not provide any response data"
        }
      ]
    },
    {
      "description": "Gets an array of all hotkey names in OBS.\n\nNote: Hotkey functionality in obs-websocket comes as-is, and we do not guarantee support if things are broken. In 9/10 usages of hotkey requests, there exists a better, more reliable method via other requests.",
      "requestType": "GetHotkeyList",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "hotkeys",
          "valueType": "Array<String>",
          "valueDescription": "Array of hotkey names"
        }
      ]
    },
    {
      "description": "Triggers a hotkey using its name. See `GetHotkeyList`.\n\nNote: Hotkey functionality in obs-websocket comes as-is, and we do not guarantee support if things are broken. In 9/10 usages of hotkey requests, there exists a better, more reliable method via other requests.",
      "requestType": "TriggerHotkeyByName",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [
        {
          "valueName": "hotkeyName",
          "valueType": "String",
          "valueDescription": "Name of the hotkey to trigger",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "contextName",
          "valueType": "String",
          "valueDescription": "Name of context of the hotkey to trigger",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Triggers a hotkey using a sequence of keys.\n\nNote: Hotkey functionality in obs-websocket comes as-is, and we do not guarantee support if things are broken. In 9/10 usages of hotkey requests, there exists a better, more reliable method via other requests.",
      "requestType": "TriggerHotkeyByKeySequence",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [
        {
          "valueName": "keyId",
          "valueType": "String",
          "valueDescription": "The OBS key ID to use. See https://github.com/obsproject/obs-studio/blob/master/libobs/obs-hotkeys.h",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Not pressed"
        },
        {
          "valueName": "keyModifiers",
          "valueType": "Object",
          "valueDescription": "Object containing key modifiers to apply",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Ignored"
        },
        {
          "valueName": "keyModifiers.shift",
          "valueType": "Boolean",
          "valueDescription": "Press Shift",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Not pressed"
        },
        {
          "valueName": "keyModifiers.control",
          "valueType": "Boolean",
          "valueDescription": "Press CTRL",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Not pressed"
        },
        {
          "valueName": "keyModifiers.alt",
          "valueType": "Boolean",
          "valueDescription": "Press ALT",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Not pressed"
        },
        {
          "valueName": "keyModifiers.command",
          "valueType": "Boolean",
          "valueDescription": "Press CMD (Mac)",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Not pressed"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sleeps for a time duration or number of frames. Only available in request batches with types `SERIAL_REALTIME` or `SERIAL_FRAME`.",
      "requestType": "Sleep",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "requestFields": [
        {
          "valueName": "sleepMillis",
          "valueType": "Number",
          "valueDescription": "Number of milliseconds to sleep for (if `SERIAL_REALTIME` mode)",
          "valueRestrictions": ">= 0, <= 50000",
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sleepFrames",
          "valueType": "Number",
          "valueDescription": "Number of frames to sleep for (if `SERIAL_FRAME` mode)",
          "valueRestrictions": ">= 0, <= 10000",
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all inputs in OBS.",
      "requestType": "GetInputList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputKind",
          "valueType": "String",
          "valueDescription": "Restrict the array to only inputs of the specified kind",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "All kinds included"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputs",
          "valueType": "Array<Object>",
          "valueDescription": "Array of inputs"
        }
      ]
    },
    {
      "description": "Gets an array of all available input kinds in OBS.",
      "requestType": "GetInputKindList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "unversioned",
          "valueType": "Boolean",
          "valueDescription": "True == Return all kinds as unversioned, False == Return with version suffixes (if available)",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "false"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputKinds",
          "valueType": "Array<String>",
          "valueDescription": "Array of input kinds"
        }
      ]
    },
    {
      "description": "Gets the names of all special inputs.",
      "requestType": "GetSpecialInputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "desktop1",
          "valueType": "String",
          "valueDescription": "Name of the Desktop Audio input"
        },
        {
          "valueName": "desktop2",
          "valueType": "String",
          "valueDescription": "Name of the Desktop Audio 2 input"
        },
        {
          "valueName": "mic1",
          "valueType": "String",
          "valueDescription": "Name of the Mic/Auxiliary Audio input"
        },
        {
          "valueName": "mic2",
          "valueType": "String",
          "valueDescription": "Name of the Mic/Auxiliary Audio 2 input"
        },
        {
          "valueName": "mic3",
          "valueType": "String",
          "valueDescription": "Name of the Mic/Auxiliary Audio 3 input"
        },
        {
          "valueName": "mic4",
          "valueType": "String",
          "valueDescription": "Name of the Mic/Auxiliary Audio 4 input"
        }
      ]
    },
    {
      "description": "Creates a new input, adding it as a scene item to the specified scene.",
      "requestType": "CreateInput",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to add the input to as a scene item",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to add the input to as a scene item",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the new input to created",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "inputKind",
          "valueType": "String",
          "valueDescription": "The kind of input to be created",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "inputSettings",
          "valueType": "Object",
          "valueDescription": "Settings object to initialize the input with",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Default settings used"
        },
        {
          "valueName": "sceneItemEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether to set the created scene item to enabled or disabled",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "True"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the newly created input"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "ID of the newly created scene item"
        }
      ]
    },
    {
      "description": "Removes an existing input.\n\nNote: Will immediately remove all associated scene items.",
      "requestType": "RemoveInput",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to remove",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to remove",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the name of an input (rename).",
      "requestType": "SetInputName",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Current input name",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "Current input UUID",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "newInputName",
          "valueType": "String",
          "valueDescription": "New name for the input",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the default settings for an input kind.",
      "requestType": "GetInputDefaultSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputKind",
          "valueType": "String",
          "valueDescription": "Input kind to get the default settings for",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "defaultInputSettings",
          "valueType": "Object",
          "valueDescription": "Object of default settings for the input kind"
        }
      ]
    },
    {
      "description": "Gets the settings of an input.\n\nNote: Does not include defaults. To create the entire settings object, overlay `inputSettings` over the `defaultInputSettings` provided by `GetInputDefaultSettings`.",
      "requestType": "GetInputSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to get the settings of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to get the settings of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputSettings",
          "valueType": "Object",
          "valueDescription": "Object of settings for the input"
        },
        {
          "valueName": "inputKind",
          "valueType": "String",
          "valueDescription": "The kind of the input"
        }
      ]
    },
    {
      "description": "Sets the settings of an input.",
      "requestType": "SetInputSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the settings of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the settings of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputSettings",
          "valueType": "Object",
          "valueDescription": "Object of settings to apply",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "overlay",
          "valueType": "Boolean",
          "valueDescription": "True == apply the settings on top of existing ones, False == reset the input to its defaults, then apply settings.",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "true"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the audio mute state of an input.",
      "requestType": "GetInputMute",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of input to get the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of input to get the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputMuted",
          "valueType": "Boolean",
          "valueDescription": "Whether the input is muted"
        }
      ]
    },
    {
      "description": "Sets the audio mute state of an input.",
      "requestType": "SetInputMute",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputMuted",
          "valueType": "Boolean",
          "valueDescription": "Whether to mute the input or not",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Toggles the audio mute state of an input.",
      "requestType": "ToggleInputMute",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to toggle the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to toggle the mute state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputMuted",
          "valueType": "Boolean",
          "valueDescription": "Whether the input has been muted or unmuted"
        }
      ]
    },
    {
      "description": "Gets the current volume setting of an input.",
      "requestType": "GetInputVolume",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to get the volume of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to get the volume of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputVolumeMul",
          "valueType": "Number",
          "valueDescription": "Volume setting in mul"
        },
        {
          "valueName": "inputVolumeDb",
          "valueType": "Number",
          "valueDescription": "Volume setting in dB"
        }
      ]
    },
    {
      "description": "Sets the volume setting of an input.",
      "requestType": "SetInputVolume",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the volume of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the volume of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputVolumeMul",
          "valueType": "Number",
          "valueDescription": "Volume setting in mul",
          "valueRestrictions": ">= 0, <= 20",
          "valueOptional": true,
          "valueOptionalBehavior": "`inputVolumeDb` should be specified"
        },
        {
          "valueName": "inputVolumeDb",
          "valueType": "Number",
          "valueDescription": "Volume setting in dB",
          "valueRestrictions": ">= -100, <= 26",
          "valueOptional": true,
          "valueOptionalBehavior": "`inputVolumeMul` should be specified"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the audio balance of an input.",
      "requestType": "GetInputAudioBalance",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to get the audio balance of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to get the audio balance of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputAudioBalance",
          "valueType": "Number",
          "valueDescription": "Audio balance value from 0.0-1.0"
        }
      ]
    },
    {
      "description": "Sets the audio balance of an input.",
      "requestType": "SetInputAudioBalance",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the audio balance of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the audio balance of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputAudioBalance",
          "valueType": "Number",
          "valueDescription": "New audio balance value",
          "valueRestrictions": ">= 0.0, <= 1.0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the audio sync offset of an input.\n\nNote: The audio sync offset can be negative too!",
      "requestType": "GetInputAudioSyncOffset",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to get the audio sync offset of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to get the audio sync offset of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputAudioSyncOffset",
          "valueType": "Number",
          "valueDescription": "Audio sync offset in milliseconds"
        }
      ]
    },
    {
      "description": "Sets the audio sync offset of an input.",
      "requestType": "SetInputAudioSyncOffset",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the audio sync offset of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the audio sync offset of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputAudioSyncOffset",
          "valueType": "Number",
          "valueDescription": "New audio sync offset in milliseconds",
          "valueRestrictions": ">= -950, <= 20000",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the audio monitor type of an input.\n\nThe available audio monitor types are:\n\n- `OBS_MONITORING_TYPE_NONE`\n- `OBS_MONITORING_TYPE_MONITOR_ONLY`\n- `OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT`",
      "requestType": "GetInputAudioMonitorType",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to get the audio monitor type of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to get the audio monitor type of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "monitorType",
          "valueType": "String",
          "valueDescription": "Audio monitor type"
        }
      ]
    },
    {
      "description": "Sets the audio monitor type of an input.",
      "requestType": "SetInputAudioMonitorType",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to set the audio monitor type of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to set the audio monitor type of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "monitorType",
          "valueType": "String",
          "valueDescription": "Audio monitor type",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the enable state of all audio tracks of an input.",
      "requestType": "GetInputAudioTracks",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "inputAudioTracks",
          "valueType": "Object",
          "valueDescription": "Object of audio tracks and associated enable states"
        }
      ]
    },
    {
      "description": "Sets the enable state of audio tracks of an input.",
      "requestType": "SetInputAudioTracks",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputAudioTracks",
          "valueType": "Object",
          "valueDescription": "Track settings to apply",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the items of a list property from an input's properties.\n\nNote: Use this in cases where an input provides a dynamic, selectable list of items. For example, display capture, where it provides a list of available displays.",
      "requestType": "GetInputPropertiesListPropertyItems",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "propertyName",
          "valueType": "String",
          "valueDescription": "Name of the list property to get the items of",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "propertyItems",
          "valueType": "Array<Object>",
          "valueDescription": "Array of items in the list property"
        }
      ]
    },
    {
      "description": "Presses a button in the properties of an input.\n\nSome known `propertyName` values are:\n\n- `refreshnocache` - Browser source reload button\n\nNote: Use this in cases where there is a button in the properties of an input that cannot be accessed in any other way. For example, browser sources, where there is a refresh button.",
      "requestType": "PressInputPropertiesButton",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "propertyName",
          "valueType": "String",
          "valueDescription": "Name of the button property to press",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the status of a media input.\n\nMedia States:\n\n- `OBS_MEDIA_STATE_NONE`\n- `OBS_MEDIA_STATE_PLAYING`\n- `OBS_MEDIA_STATE_OPENING`\n- `OBS_MEDIA_STATE_BUFFERING`\n- `OBS_MEDIA_STATE_PAUSED`\n- `OBS_MEDIA_STATE_STOPPED`\n- `OBS_MEDIA_STATE_ENDED`\n- `OBS_MEDIA_STATE_ERROR`",
      "requestType": "GetMediaInputStatus",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "mediaState",
          "valueType": "String",
          "valueDescription": "State of the media input"
        },
        {
          "valueName": "mediaDuration",
          "valueType": "Number",
          "valueDescription": "Total duration of the playing media in milliseconds. `null` if not playing"
        },
        {
          "valueName": "mediaCursor",
          "valueType": "Number",
          "valueDescription": "Position of the cursor in milliseconds. `null` if not playing"
        }
      ]
    },
    {
      "description": "Sets the cursor position of a media input.\n\nThis request does not perform bounds checking of the cursor position.",
      "requestType": "SetMediaInputCursor",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "mediaCursor",
          "valueType": "Number",
          "valueDescription": "New cursor position to set",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Offsets the current cursor position of a media input by the specified value.\n\nThis request does not perform bounds checking of the cursor position.",
      "requestType": "OffsetMediaInputCursor",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "mediaCursorOffset",
          "valueType": "Number",
          "valueDescription": "Value to offset the current cursor position by",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Triggers an action on a media input.",
      "requestType": "TriggerMediaInputAction",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the media input",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "mediaAction",
          "valueType": "String",
          "valueDescription": "Identifier of the `ObsMediaInputAction` enum",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the status of the virtualcam output.",
      "requestType": "GetVirtualCamStatus",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        }
      ]
    },
    {
      "description": "Toggles the state of the virtualcam output.",
      "requestType": "ToggleVirtualCam",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        }
      ]
    },
    {
      "description": "Starts the virtualcam output.",
      "requestType": "StartVirtualCam",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Stops the virtualcam output.",
      "requestType": "StopVirtualCam",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Gets the status of the replay buffer output.",
      "requestType": "GetReplayBufferStatus",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        }
      ]
    },
    {
      "description": "Toggles the state of the replay buffer output.",
      "requestType": "ToggleReplayBuffer",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        }
      ]
    },
    {
      "description": "Starts the replay buffer output.",
      "requestType": "StartReplayBuffer",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Stops the replay buffer output.",
      "requestType": "StopReplayBuffer",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Saves the contents of the replay buffer output.",
      "requestType": "SaveReplayBuffer",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Gets the filename of the last replay buffer save file.",
      "requestType": "GetLastReplayBufferReplay",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "savedReplayPath",
          "valueType": "String",
          "valueDescription": "File path"
        }
      ]
    },
    {
      "description": "Gets the list of available outputs.",
      "requestType": "GetOutputList",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputs",
          "valueType": "Array<Object>",
          "valueDescription": "Array of outputs"
        }
      ]
    },
    {
      "description": "Gets the status of an output.",
      "requestType": "GetOutputStatus",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputReconnecting",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is reconnecting"
        },
        {
          "valueName": "outputTimecode",
          "valueType": "String",
          "valueDescription": "Current formatted timecode string for the output"
        },
        {
          "valueName": "outputDuration",
          "valueType": "Number",
          "valueDescription": "Current duration in milliseconds for the output"
        },
        {
          "valueName": "outputCongestion",
          "valueType": "Number",
          "valueDescription": "Congestion of the output"
        },
        {
          "valueName": "outputBytes",
          "valueType": "Number",
          "valueDescription": "Number of bytes sent by the output"
        },
        {
          "valueName": "outputSkippedFrames",
          "valueType": "Number",
          "valueDescription": "Number of frames skipped by the output's process"
        },
        {
          "valueName": "outputTotalFrames",
          "valueType": "Number",
          "valueDescription": "Total number of frames delivered by the output's process"
        }
      ]
    },
    {
      "description": "Toggles the status of an output.",
      "requestType": "ToggleOutput",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        }
      ]
    },
    {
      "description": "Starts an output.",
      "requestType": "StartOutput",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Stops an output.",
      "requestType": "StopOutput",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the settings of an output.",
      "requestType": "GetOutputSettings",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "outputSettings",
          "valueType": "Object",
          "valueDescription": "Output settings"
        }
      ]
    },
    {
      "description": "Sets the settings of an output.",
      "requestType": "SetOutputSettings",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "requestFields": [
        {
          "valueName": "outputName",
          "valueType": "String",
          "valueDescription": "Output name",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "outputSettings",
          "valueType": "Object",
          "valueDescription": "Output settings",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the status of the record output.",
      "requestType": "GetRecordStatus",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputPaused",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is paused"
        },
        {
          "valueName": "outputTimecode",
          "valueType": "String",
          "valueDescription": "Current formatted timecode string for the output"
        },
        {
          "valueName": "outputDuration",
          "valueType": "Number",
          "valueDescription": "Current duration in milliseconds for the output"
        },
        {
          "valueName": "outputBytes",
          "valueType": "Number",
          "valueDescription": "Number of bytes sent by the output"
        }
      ]
    },
    {
      "description": "Toggles the status of the record output.",
      "requestType": "ToggleRecord",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "The new active state of the output"
        }
      ]
    },
    {
      "description": "Starts the record output.",
      "requestType": "StartRecord",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Stops the record output.",
      "requestType": "StopRecord",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputPath",
          "valueType": "String",
          "valueDescription": "File name for the saved recording"
        }
      ]
    },
    {
      "description": "Toggles pause on the record output.",
      "requestType": "ToggleRecordPause",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Pauses the record output.",
      "requestType": "PauseRecord",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Resumes the record output.",
      "requestType": "ResumeRecord",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "record",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Splits the current file being recorded into a new file.",
      "requestType": "SplitRecordFile",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.5.0",
      "category": "record",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Adds a new chapter marker to the file currently being recorded.\n\nNote: As of OBS 30.2.0, the only file format supporting this feature is Hybrid MP4.",
      "requestType": "CreateRecordChapter",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.5.0",
      "category": "record",
      "requestFields": [
        {
          "valueName": "chapterName",
          "valueType": "String",
          "valueDescription": "Name of the new chapter",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets a list of all scene items in a scene.\n\nScenes only",
      "requestType": "GetSceneItemList",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to get the items of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to get the items of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItems",
          "valueType": "Array<Object>",
          "valueDescription": "Array of scene items in the scene"
        }
      ]
    },
    {
      "description": "Basically GetSceneItemList, but for groups.\n\nUsing groups at all in OBS is discouraged, as they are very broken under the hood. Please use nested scenes instead.\n\nGroups only",
      "requestType": "GetGroupSceneItemList",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the group to get the items of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the group to get the items of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItems",
          "valueType": "Array<Object>",
          "valueDescription": "Array of scene items in the group"
        }
      ]
    },
    {
      "description": "Searches a scene for a source, and returns its id.\n\nScenes and Groups",
      "requestType": "GetSceneItemId",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene or group to search in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene or group to search in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to find",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "searchOffset",
          "valueType": "Number",
          "valueDescription": "Number of matches to skip during search. >= 0 means first forward. -1 means last (top) item",
          "valueRestrictions": ">= -1",
          "valueOptional": true,
          "valueOptionalBehavior": "0"
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        }
      ]
    },
    {
      "description": "Gets the source associated with a scene item.",
      "requestType": "GetSceneItemSource",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.4.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source associated with the scene item"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source associated with the scene item"
        }
      ]
    },
    {
      "description": "Creates a new scene item using a source.\n\nScenes only",
      "requestType": "CreateSceneItem",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to create the new item in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to create the new item in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to add to the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to add to the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemEnabled",
          "valueType": "Boolean",
          "valueDescription": "Enable state to apply to the scene item on creation",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "True"
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        }
      ]
    },
    {
      "description": "Removes a scene item from a scene.\n\nScenes only",
      "requestType": "RemoveSceneItem",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Duplicates a scene item, copying all transform and crop info.\n\nScenes only",
      "requestType": "DuplicateSceneItem",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "destinationSceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to create the duplicated item in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "From scene is assumed"
        },
        {
          "valueName": "destinationSceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to create the duplicated item in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "From scene is assumed"
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the duplicated scene item"
        }
      ]
    },
    {
      "description": "Gets the transform and crop info of a scene item.\n\nScenes and Groups",
      "requestType": "GetSceneItemTransform",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemTransform",
          "valueType": "Object",
          "valueDescription": "Object containing scene item transform info"
        }
      ]
    },
    {
      "description": "Sets the transform and crop info of a scene item.",
      "requestType": "SetSceneItemTransform",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "sceneItemTransform",
          "valueType": "Object",
          "valueDescription": "Object containing scene item transform info to update",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the enable state of a scene item.\n\nScenes and Groups",
      "requestType": "GetSceneItemEnabled",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether the scene item is enabled. `true` for enabled, `false` for disabled"
        }
      ]
    },
    {
      "description": "Sets the enable state of a scene item.\n\nScenes and Groups",
      "requestType": "SetSceneItemEnabled",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "sceneItemEnabled",
          "valueType": "Boolean",
          "valueDescription": "New enable state of the scene item",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the lock state of a scene item.\n\nScenes and Groups",
      "requestType": "GetSceneItemLocked",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemLocked",
          "valueType": "Boolean",
          "valueDescription": "Whether the scene item is locked. `true` for locked, `false` for unlocked"
        }
      ]
    },
    {
      "description": "Sets the lock state of a scene item.\n\nScenes and Group",
      "requestType": "SetSceneItemLocked",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "sceneItemLocked",
          "valueType": "Boolean",
          "valueDescription": "New lock state of the scene item",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the index position of a scene item in a scene.\n\nAn index of 0 is at the bottom of the source list in the UI.\n\nScenes and Groups",
      "requestType": "GetSceneItemIndex",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemIndex",
          "valueType": "Number",
          "valueDescription": "Index position of the scene item"
        }
      ]
    },
    {
      "description": "Sets the index position of a scene item in a scene.\n\nScenes and Groups",
      "requestType": "SetSceneItemIndex",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "sceneItemIndex",
          "valueType": "Number",
          "valueDescription": "New index position of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the blend mode of a scene item.\n\nBlend modes:\n\n- `OBS_BLEND_NORMAL`\n- `OBS_BLEND_ADDITIVE`\n- `OBS_BLEND_SUBTRACT`\n- `OBS_BLEND_SCREEN`\n- `OBS_BLEND_MULTIPLY`\n- `OBS_BLEND_LIGHTEN`\n- `OBS_BLEND_DARKEN`\n\nScenes and Groups",
      "requestType": "GetSceneItemBlendMode",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneItemBlendMode",
          "valueType": "String",
          "valueDescription": "Current blend mode"
        }
      ]
    },
    {
      "description": "Sets the blend mode of a scene item.\n\nScenes and Groups",
      "requestType": "SetSceneItemBlendMode",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item",
          "valueRestrictions": ">= 0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "sceneItemBlendMode",
          "valueType": "String",
          "valueDescription": "New blend mode",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all scenes in OBS.",
      "requestType": "GetSceneList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "currentProgramSceneName",
          "valueType": "String",
          "valueDescription": "Current program scene name. Can be `null` if internal state desync"
        },
        {
          "valueName": "currentProgramSceneUuid",
          "valueType": "String",
          "valueDescription": "Current program scene UUID. Can be `null` if internal state desync"
        },
        {
          "valueName": "currentPreviewSceneName",
          "valueType": "String",
          "valueDescription": "Current preview scene name. `null` if not in studio mode"
        },
        {
          "valueName": "currentPreviewSceneUuid",
          "valueType": "String",
          "valueDescription": "Current preview scene UUID. `null` if not in studio mode"
        },
        {
          "valueName": "scenes",
          "valueType": "Array<Object>",
          "valueDescription": "Array of scenes"
        }
      ]
    },
    {
      "description": "Gets an array of all groups in OBS.\n\nGroups in OBS are actually scenes, but renamed and modified. In obs-websocket, we treat them as scenes where we can.",
      "requestType": "GetGroupList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "groups",
          "valueType": "Array<String>",
          "valueDescription": "Array of group names"
        }
      ]
    },
    {
      "description": "Gets the current program scene.\n\nNote: This request is slated to have the `currentProgram`-prefixed fields removed from in an upcoming RPC version.",
      "requestType": "GetCurrentProgramScene",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Current program scene name"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "Current program scene UUID"
        },
        {
          "valueName": "currentProgramSceneName",
          "valueType": "String",
          "valueDescription": "Current program scene name (Deprecated)"
        },
        {
          "valueName": "currentProgramSceneUuid",
          "valueType": "String",
          "valueDescription": "Current program scene UUID (Deprecated)"
        }
      ]
    },
    {
      "description": "Sets the current program scene.",
      "requestType": "SetCurrentProgramScene",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Scene name to set as the current program scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "Scene UUID to set as the current program scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the current preview scene.\n\nOnly available when studio mode is enabled.\n\nNote: This request is slated to have the `currentPreview`-prefixed fields removed from in an upcoming RPC version.",
      "requestType": "GetCurrentPreviewScene",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Current preview scene name"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "Current preview scene UUID"
        },
        {
          "valueName": "currentPreviewSceneName",
          "valueType": "String",
          "valueDescription": "Current preview scene name"
        },
        {
          "valueName": "currentPreviewSceneUuid",
          "valueType": "String",
          "valueDescription": "Current preview scene UUID"
        }
      ]
    },
    {
      "description": "Sets the current preview scene.\n\nOnly available when studio mode is enabled.",
      "requestType": "SetCurrentPreviewScene",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Scene name to set as the current preview scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "Scene UUID to set as the current preview scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Creates a new scene in OBS.",
      "requestType": "CreateScene",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name for the new scene",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": [
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the created scene"
        }
      ]
    },
    {
      "description": "Removes a scene from OBS.",
      "requestType": "RemoveScene",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to remove",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to remove",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the name of a scene (rename).",
      "requestType": "SetSceneName",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene to be renamed",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene to be renamed",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "newSceneName",
          "valueType": "String",
          "valueDescription": "New name for the scene",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the scene transition overridden for a scene.\n\nNote: A transition UUID response field is not currently able to be implemented as of 2024-1-18.",
      "requestType": "GetSceneSceneTransitionOverride",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Name of the overridden scene transition, else `null`"
        },
        {
          "valueName": "transitionDuration",
          "valueType": "Number",
          "valueDescription": "Duration of the overridden scene transition, else `null`"
        }
      ]
    },
    {
      "description": "Sets the scene transition overridden for a scene.",
      "requestType": "SetSceneSceneTransitionOverride",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "requestFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Name of the scene transition to use as override. Specify `null` to remove",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unchanged"
        },
        {
          "valueName": "transitionDuration",
          "valueType": "Number",
          "valueDescription": "Duration to use for any overridden transition. Specify `null` to remove",
          "valueRestrictions": ">= 50, <= 20000",
          "valueOptional": true,
          "valueOptionalBehavior": "Unchanged"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the active and show state of a source.\n\n**Compatible with inputs and scenes.**",
      "requestType": "GetSourceActive",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "sources",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to get the active state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to get the active state of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": [
        {
          "valueName": "videoActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the source is showing in Program"
        },
        {
          "valueName": "videoShowing",
          "valueType": "Boolean",
          "valueDescription": "Whether the source is showing in the UI (Preview, Projector, Properties)"
        }
      ]
    },
    {
      "description": "Gets a Base64-encoded screenshot of a source.\n\nThe `imageWidth` and `imageHeight` parameters are treated as \"scale to inner\", meaning the smallest ratio will be used and the aspect ratio of the original resolution is kept.\nIf `imageWidth` and `imageHeight` are not specified, the compressed image will use the full resolution of the source.\n\n**Compatible with inputs and scenes.**",
      "requestType": "GetSourceScreenshot",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "sources",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to take a screenshot of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to take a screenshot of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "imageFormat",
          "valueType": "String",
          "valueDescription": "Image compression format to use. Use `GetVersion` to get compatible image formats",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "imageWidth",
          "valueType": "Number",
          "valueDescription": "Width to scale the screenshot to",
          "valueRestrictions": ">= 8, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Source value is used"
        },
        {
          "valueName": "imageHeight",
          "valueType": "Number",
          "valueDescription": "Height to scale the screenshot to",
          "valueRestrictions": ">= 8, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Source value is used"
        },
        {
          "valueName": "imageCompressionQuality",
          "valueType": "Number",
          "valueDescription": "Compression quality to use. 0 for high compression, 100 for uncompressed. -1 to use \"default\" (whatever that means, idk)",
          "valueRestrictions": ">= -1, <= 100",
          "valueOptional": true,
          "valueOptionalBehavior": "-1"
        }
      ],
      "responseFields": [
        {
          "valueName": "imageData",
          "valueType": "String",
          "valueDescription": "Base64-encoded screenshot"
        }
      ]
    },
    {
      "description": "Saves a screenshot of a source to the filesystem.\n\nThe `imageWidth` and `imageHeight` parameters are treated as \"scale to inner\", meaning the smallest ratio will be used and the aspect ratio of the original resolution is kept.\nIf `imageWidth` and `imageHeight` are not specified, the compressed image will use the full resolution of the source.\n\n**Compatible with inputs and scenes.**",
      "requestType": "SaveSourceScreenshot",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "sources",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to take a screenshot of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to take a screenshot of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "imageFormat",
          "valueType": "String",
          "valueDescription": "Image compression format to use. Use `GetVersion` to get compatible image formats",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "imageFilePath",
          "valueType": "String",
          "valueDescription": "Path to save the screenshot file to. Eg. `C:\\Users\\user\\Desktop\\screenshot.png`",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "imageWidth",
          "valueType": "Number",
          "valueDescription": "Width to scale the screenshot to",
          "valueRestrictions": ">= 8, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Source value is used"
        },
        {
          "valueName": "imageHeight",
          "valueType": "Number",
          "valueDescription": "Height to scale the screenshot to",
          "valueRestrictions": ">= 8, <= 4096",
          "valueOptional": true,
          "valueOptionalBehavior": "Source value is used"
        },
        {
          "valueName": "imageCompressionQuality",
          "valueType": "Number",
          "valueDescription": "Compression quality to use. 0 for high compression, 100 for uncompressed. -1 to use \"default\" (whatever that means, idk)",
          "valueRestrictions": ">= -1, <= 100",
          "valueOptional": true,
          "valueOptionalBehavior": "-1"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the status of the stream output.",
      "requestType": "GetStreamStatus",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "stream",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputReconnecting",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is currently reconnecting"
        },
        {
          "valueName": "outputTimecode",
          "valueType": "String",
          "valueDescription": "Current formatted timecode string for the output"
        },
        {
          "valueName": "outputDuration",
          "valueType": "Number",
          "valueDescription": "Current duration in milliseconds for the output"
        },
        {
          "valueName": "outputCongestion",
          "valueType": "Number",
          "valueDescription": "Congestion of the output"
        },
        {
          "valueName": "outputBytes",
          "valueType": "Number",
          "valueDescription": "Number of bytes sent by the output"
        },
        {
          "valueName": "outputSkippedFrames",
          "valueType": "Number",
          "valueDescription": "Number of frames skipped by the output's process"
        },
        {
          "valueName": "outputTotalFrames",
          "valueType": "Number",
          "valueDescription": "Total number of frames delivered by the output's process"
        }
      ]
    },
    {
      "description": "Toggles the status of the stream output.",
      "requestType": "ToggleStream",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "stream",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "New state of the stream output"
        }
      ]
    },
    {
      "description": "Starts the stream output.",
      "requestType": "StartStream",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "stream",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Stops the stream output.",
      "requestType": "StopStream",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "stream",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Sends CEA-608 caption text over the stream output.",
      "requestType": "SendStreamCaption",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "stream",
      "requestFields": [
        {
          "valueName": "captionText",
          "valueType": "String",
          "valueDescription": "Caption text",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets an array of all available transition kinds.\n\nSimilar to `GetInputKindList`",
      "requestType": "GetTransitionKindList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "transitionKinds",
          "valueType": "Array<String>",
          "valueDescription": "Array of transition kinds"
        }
      ]
    },
    {
      "description": "Gets an array of all scene transitions in OBS.",
      "requestType": "GetSceneTransitionList",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "currentSceneTransitionName",
          "valueType": "String",
          "valueDescription": "Name of the current scene transition. Can be null"
        },
        {
          "valueName": "currentSceneTransitionUuid",
          "valueType": "String",
          "valueDescription": "UUID of the current scene transition. Can be null"
        },
        {
          "valueName": "currentSceneTransitionKind",
          "valueType": "String",
          "valueDescription": "Kind of the current scene transition. Can be null"
        },
        {
          "valueName": "transitions",
          "valueType": "Array<Object>",
          "valueDescription": "Array of transitions"
        }
      ]
    },
    {
      "description": "Gets information about the current scene transition.",
      "requestType": "GetCurrentSceneTransition",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Name of the transition"
        },
        {
          "valueName": "transitionUuid",
          "valueType": "String",
          "valueDescription": "UUID of the transition"
        },
        {
          "valueName": "transitionKind",
          "valueType": "String",
          "valueDescription": "Kind of the transition"
        },
        {
          "valueName": "transitionFixed",
          "valueType": "Boolean",
          "valueDescription": "Whether the transition uses a fixed (unconfigurable) duration"
        },
        {
          "valueName": "transitionDuration",
          "valueType": "Number",
          "valueDescription": "Configured transition duration in milliseconds. `null` if transition is fixed"
        },
        {
          "valueName": "transitionConfigurable",
          "valueType": "Boolean",
          "valueDescription": "Whether the transition supports being configured"
        },
        {
          "valueName": "transitionSettings",
          "valueType": "Object",
          "valueDescription": "Object of settings for the transition. `null` if transition is not configurable"
        }
      ]
    },
    {
      "description": "Sets the current scene transition.\n\nSmall note: While the namespace of scene transitions is generally unique, that uniqueness is not a guarantee as it is with other resources like inputs.",
      "requestType": "SetCurrentSceneTransition",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Name of the transition to make active",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the duration of the current scene transition, if it is not fixed.",
      "requestType": "SetCurrentSceneTransitionDuration",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [
        {
          "valueName": "transitionDuration",
          "valueType": "Number",
          "valueDescription": "Duration in milliseconds",
          "valueRestrictions": ">= 50, <= 20000",
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Sets the settings of the current scene transition.",
      "requestType": "SetCurrentSceneTransitionSettings",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [
        {
          "valueName": "transitionSettings",
          "valueType": "Object",
          "valueDescription": "Settings object to apply to the transition. Can be `{}`",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "overlay",
          "valueType": "Boolean",
          "valueDescription": "Whether to overlay over the current settings or replace them",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "true"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets the cursor position of the current scene transition.\n\nNote: `transitionCursor` will return 1.0 when the transition is inactive.",
      "requestType": "GetCurrentSceneTransitionCursor",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "transitionCursor",
          "valueType": "Number",
          "valueDescription": "Cursor position, between 0.0 and 1.0"
        }
      ]
    },
    {
      "description": "Triggers the current scene transition. Same functionality as the `Transition` button in studio mode.",
      "requestType": "TriggerStudioModeTransition",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [],
      "responseFields": []
    },
    {
      "description": "Sets the position of the TBar.\n\n**Very important note**: This will be deprecated and replaced in a future version of obs-websocket.",
      "requestType": "SetTBarPosition",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "requestFields": [
        {
          "valueName": "position",
          "valueType": "Number",
          "valueDescription": "New position",
          "valueRestrictions": ">= 0.0, <= 1.0",
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "release",
          "valueType": "Boolean",
          "valueDescription": "Whether to release the TBar. Only set `false` if you know that you will be sending another position update",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "`true`"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets whether studio is enabled.",
      "requestType": "GetStudioModeEnabled",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "studioModeEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether studio mode is enabled"
        }
      ]
    },
    {
      "description": "Enables or disables studio mode",
      "requestType": "SetStudioModeEnabled",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "studioModeEnabled",
          "valueType": "Boolean",
          "valueDescription": "True == Enabled, False == Disabled",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        }
      ],
      "responseFields": []
    },
    {
      "description": "Opens the properties dialog of an input.",
      "requestType": "OpenInputPropertiesDialog",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Opens the filters dialog of an input.",
      "requestType": "OpenInputFiltersDialog",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Opens the interact dialog of an input.",
      "requestType": "OpenInputInteractDialog",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input to open the dialog of",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Gets a list of connected monitors and information about them.",
      "requestType": "GetMonitorList",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [],
      "responseFields": [
        {
          "valueName": "monitors",
          "valueType": "Array<Object>",
          "valueDescription": "a list of detected monitors with some information"
        }
      ]
    },
    {
      "description": "Opens a projector for a specific output video mix.\n\nMix types:\n\n- `OBS_WEBSOCKET_VIDEO_MIX_TYPE_PREVIEW`\n- `OBS_WEBSOCKET_VIDEO_MIX_TYPE_PROGRAM`\n- `OBS_WEBSOCKET_VIDEO_MIX_TYPE_MULTIVIEW`\n\nNote: This request serves to provide feature parity with 4.x. It is very likely to be changed/deprecated in a future release.",
      "requestType": "OpenVideoMixProjector",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "videoMixType",
          "valueType": "String",
          "valueDescription": "Type of mix to open",
          "valueRestrictions": null,
          "valueOptional": false,
          "valueOptionalBehavior": null
        },
        {
          "valueName": "monitorIndex",
          "valueType": "Number",
          "valueDescription": "Monitor index, use `GetMonitorList` to obtain index",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "-1: Opens projector in windowed mode"
        },
        {
          "valueName": "projectorGeometry",
          "valueType": "String",
          "valueDescription": "Size/Position data for a windowed projector, in Qt Base64 encoded format. Mutually exclusive with `monitorIndex`",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "N/A"
        }
      ],
      "responseFields": []
    },
    {
      "description": "Opens a projector for a source.\n\nNote: This request serves to provide feature parity with 4.x. It is very likely to be changed/deprecated in a future release.",
      "requestType": "OpenSourceProjector",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "requestFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source to open a projector for",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the source to open a projector for",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "Unknown"
        },
        {
          "valueName": "monitorIndex",
          "valueType": "Number",
          "valueDescription": "Monitor index, use `GetMonitorList` to obtain index",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "-1: Opens projector in windowed mode"
        },
        {
          "valueName": "projectorGeometry",
          "valueType": "String",
          "valueDescription": "Size/Position data for a windowed projector, in Qt Base64 encoded format. Mutually exclusive with `monitorIndex`",
          "valueRestrictions": null,
          "valueOptional": true,
          "valueOptionalBehavior": "N/A"
        }
      ],
      "responseFields": []
    }
  ],
  "events": [
    {
      "description": "The current scene collection has begun changing.\n\nNote: We recommend using this event to trigger a pause of all polling requests, as performing any requests during a\nscene collection change is considered undefined behavior and can cause crashes!",
      "eventType": "CurrentSceneCollectionChanging",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "sceneCollectionName",
          "valueType": "String",
          "valueDescription": "Name of the current scene collection"
        }
      ]
    },
    {
      "description": "The current scene collection has changed.\n\nNote: If polling has been paused during `CurrentSceneCollectionChanging`, this is the que to restart polling.",
      "eventType": "CurrentSceneCollectionChanged",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "sceneCollectionName",
          "valueType": "String",
          "valueDescription": "Name of the new scene collection"
        }
      ]
    },
    {
      "description": "The scene collection list has changed.",
      "eventType": "SceneCollectionListChanged",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "sceneCollections",
          "valueType": "Array<String>",
          "valueDescription": "Updated list of scene collections"
        }
      ]
    },
    {
      "description": "The current profile has begun changing.",
      "eventType": "CurrentProfileChanging",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "profileName",
          "valueType": "String",
          "valueDescription": "Name of the current profile"
        }
      ]
    },
    {
      "description": "The current profile has changed.",
      "eventType": "CurrentProfileChanged",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "profileName",
          "valueType": "String",
          "valueDescription": "Name of the new profile"
        }
      ]
    },
    {
      "description": "The profile list has changed.",
      "eventType": "ProfileListChanged",
      "eventSubscription": "Config",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "config",
      "dataFields": [
        {
          "valueName": "profiles",
          "valueType": "Array<String>",
          "valueDescription": "Updated list of profiles"
        }
      ]
    },
    {
      "description": "A source's filter list has been reindexed.",
      "eventType": "SourceFilterListReindexed",
      "eventSubscription": "Filters",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source"
        },
        {
          "valueName": "filters",
          "valueType": "Array<Object>",
          "valueDescription": "Array of filter objects"
        }
      ]
    },
    {
      "description": "A filter has been added to a source.",
      "eventType": "SourceFilterCreated",
      "eventSubscription": "Filters",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter was added to"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter"
        },
        {
          "valueName": "filterKind",
          "valueType": "String",
          "valueDescription": "The kind of the filter"
        },
        {
          "valueName": "filterIndex",
          "valueType": "Number",
          "valueDescription": "Index position of the filter"
        },
        {
          "valueName": "filterSettings",
          "valueType": "Object",
          "valueDescription": "The settings configured to the filter when it was created"
        },
        {
          "valueName": "defaultFilterSettings",
          "valueType": "Object",
          "valueDescription": "The default settings for the filter"
        }
      ]
    },
    {
      "description": "A filter has been removed from a source.",
      "eventType": "SourceFilterRemoved",
      "eventSubscription": "Filters",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter was on"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter"
        }
      ]
    },
    {
      "description": "The name of a source filter has changed.",
      "eventType": "SourceFilterNameChanged",
      "eventSubscription": "Filters",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "The source the filter is on"
        },
        {
          "valueName": "oldFilterName",
          "valueType": "String",
          "valueDescription": "Old name of the filter"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "New name of the filter"
        }
      ]
    },
    {
      "description": "An source filter's settings have changed (been updated).",
      "eventType": "SourceFilterSettingsChanged",
      "eventSubscription": "Filters",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.4.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter"
        },
        {
          "valueName": "filterSettings",
          "valueType": "Object",
          "valueDescription": "New settings object of the filter"
        }
      ]
    },
    {
      "description": "A source filter's enable state has changed.",
      "eventType": "SourceFilterEnableStateChanged",
      "eventSubscription": "Filters",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "filters",
      "dataFields": [
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the source the filter is on"
        },
        {
          "valueName": "filterName",
          "valueType": "String",
          "valueDescription": "Name of the filter"
        },
        {
          "valueName": "filterEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether the filter is enabled"
        }
      ]
    },
    {
      "description": "OBS has begun the shutdown process.",
      "eventType": "ExitStarted",
      "eventSubscription": "General",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "dataFields": []
    },
    {
      "description": "An input has been created.",
      "eventType": "InputCreated",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputKind",
          "valueType": "String",
          "valueDescription": "The kind of the input"
        },
        {
          "valueName": "unversionedInputKind",
          "valueType": "String",
          "valueDescription": "The unversioned kind of input (aka no `_v2` stuff)"
        },
        {
          "valueName": "inputSettings",
          "valueType": "Object",
          "valueDescription": "The settings configured to the input when it was created"
        },
        {
          "valueName": "defaultInputSettings",
          "valueType": "Object",
          "valueDescription": "The default settings for the input"
        }
      ]
    },
    {
      "description": "An input has been removed.",
      "eventType": "InputRemoved",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        }
      ]
    },
    {
      "description": "The name of an input has changed.",
      "eventType": "InputNameChanged",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "oldInputName",
          "valueType": "String",
          "valueDescription": "Old name of the input"
        },
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "New name of the input"
        }
      ]
    },
    {
      "description": "An input's settings have changed (been updated).\n\nNote: On some inputs, changing values in the properties dialog will cause an immediate update. Pressing the \"Cancel\" button will revert the settings, resulting in another event being fired.",
      "eventType": "InputSettingsChanged",
      "eventSubscription": "Inputs",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.4.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputSettings",
          "valueType": "Object",
          "valueDescription": "New settings object of the input"
        }
      ]
    },
    {
      "description": "An input's active state has changed.\n\nWhen an input is active, it means it's being shown by the program feed.",
      "eventType": "InputActiveStateChanged",
      "eventSubscription": "InputActiveStateChanged",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "videoActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the input is active"
        }
      ]
    },
    {
      "description": "An input's show state has changed.\n\nWhen an input is showing, it means it's being shown by the preview or a dialog.",
      "eventType": "InputShowStateChanged",
      "eventSubscription": "InputShowStateChanged",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "videoShowing",
          "valueType": "Boolean",
          "valueDescription": "Whether the input is showing"
        }
      ]
    },
    {
      "description": "An input's mute state has changed.",
      "eventType": "InputMuteStateChanged",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputMuted",
          "valueType": "Boolean",
          "valueDescription": "Whether the input is muted"
        }
      ]
    },
    {
      "description": "An input's volume level has changed.",
      "eventType": "InputVolumeChanged",
      "eventSubscription": "Inputs",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputVolumeMul",
          "valueType": "Number",
          "valueDescription": "New volume level multiplier"
        },
        {
          "valueName": "inputVolumeDb",
          "valueType": "Number",
          "valueDescription": "New volume level in dB"
        }
      ]
    },
    {
      "description": "The audio balance value of an input has changed.",
      "eventType": "InputAudioBalanceChanged",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputAudioBalance",
          "valueType": "Number",
          "valueDescription": "New audio balance value of the input"
        }
      ]
    },
    {
      "description": "The sync offset of an input has changed.",
      "eventType": "InputAudioSyncOffsetChanged",
      "eventSubscription": "Inputs",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputAudioSyncOffset",
          "valueType": "Number",
          "valueDescription": "New sync offset in milliseconds"
        }
      ]
    },
    {
      "description": "The audio tracks of an input have changed.",
      "eventType": "InputAudioTracksChanged",
      "eventSubscription": "Inputs",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "inputAudioTracks",
          "valueType": "Object",
          "valueDescription": "Object of audio tracks along with their associated enable states"
        }
      ]
    },
    {
      "description": "The monitor type of an input has changed.\n\nAvailable types are:\n\n- `OBS_MONITORING_TYPE_NONE`\n- `OBS_MONITORING_TYPE_MONITOR_ONLY`\n- `OBS_MONITORING_TYPE_MONITOR_AND_OUTPUT`",
      "eventType": "InputAudioMonitorTypeChanged",
      "eventSubscription": "Inputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "monitorType",
          "valueType": "String",
          "valueDescription": "New monitor type of the input"
        }
      ]
    },
    {
      "description": "A high-volume event providing volume levels of all active inputs every 50 milliseconds.",
      "eventType": "InputVolumeMeters",
      "eventSubscription": "InputVolumeMeters",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "inputs",
      "dataFields": [
        {
          "valueName": "inputs",
          "valueType": "Array<Object>",
          "valueDescription": "Array of active inputs with their associated volume levels"
        }
      ]
    },
    {
      "description": "A media input has started playing.",
      "eventType": "MediaInputPlaybackStarted",
      "eventSubscription": "MediaInputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        }
      ]
    },
    {
      "description": "A media input has finished playing.",
      "eventType": "MediaInputPlaybackEnded",
      "eventSubscription": "MediaInputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        }
      ]
    },
    {
      "description": "An action has been performed on an input.",
      "eventType": "MediaInputActionTriggered",
      "eventSubscription": "MediaInputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "media inputs",
      "dataFields": [
        {
          "valueName": "inputName",
          "valueType": "String",
          "valueDescription": "Name of the input"
        },
        {
          "valueName": "inputUuid",
          "valueType": "String",
          "valueDescription": "UUID of the input"
        },
        {
          "valueName": "mediaAction",
          "valueType": "String",
          "valueDescription": "Action performed on the input. See `ObsMediaInputAction` enum"
        }
      ]
    },
    {
      "description": "The state of the stream output has changed.",
      "eventType": "StreamStateChanged",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputState",
          "valueType": "String",
          "valueDescription": "The specific state of the output"
        }
      ]
    },
    {
      "description": "The state of the record output has changed.",
      "eventType": "RecordStateChanged",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputState",
          "valueType": "String",
          "valueDescription": "The specific state of the output"
        },
        {
          "valueName": "outputPath",
          "valueType": "String",
          "valueDescription": "File name for the saved recording, if record stopped. `null` otherwise"
        }
      ]
    },
    {
      "description": "The record output has started writing to a new file. For example, when a file split happens.",
      "eventType": "RecordFileChanged",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.5.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "newOutputPath",
          "valueType": "String",
          "valueDescription": "File name that the output has begun writing to"
        }
      ]
    },
    {
      "description": "The state of the replay buffer output has changed.",
      "eventType": "ReplayBufferStateChanged",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputState",
          "valueType": "String",
          "valueDescription": "The specific state of the output"
        }
      ]
    },
    {
      "description": "The state of the virtualcam output has changed.",
      "eventType": "VirtualcamStateChanged",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "outputActive",
          "valueType": "Boolean",
          "valueDescription": "Whether the output is active"
        },
        {
          "valueName": "outputState",
          "valueType": "String",
          "valueDescription": "The specific state of the output"
        }
      ]
    },
    {
      "description": "The replay buffer has been saved.",
      "eventType": "ReplayBufferSaved",
      "eventSubscription": "Outputs",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "outputs",
      "dataFields": [
        {
          "valueName": "savedReplayPath",
          "valueType": "String",
          "valueDescription": "Path of the saved replay file"
        }
      ]
    },
    {
      "description": "A scene item has been created.",
      "eventType": "SceneItemCreated",
      "eventSubscription": "SceneItems",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item was added to"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item was added to"
        },
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the underlying source (input/scene)"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the underlying source (input/scene)"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        },
        {
          "valueName": "sceneItemIndex",
          "valueType": "Number",
          "valueDescription": "Index position of the item"
        }
      ]
    },
    {
      "description": "A scene item has been removed.\n\nThis event is not emitted when the scene the item is in is removed.",
      "eventType": "SceneItemRemoved",
      "eventSubscription": "SceneItems",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item was removed from"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item was removed from"
        },
        {
          "valueName": "sourceName",
          "valueType": "String",
          "valueDescription": "Name of the underlying source (input/scene)"
        },
        {
          "valueName": "sourceUuid",
          "valueType": "String",
          "valueDescription": "UUID of the underlying source (input/scene)"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        }
      ]
    },
    {
      "description": "A scene's item list has been reindexed.",
      "eventType": "SceneItemListReindexed",
      "eventSubscription": "SceneItems",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene"
        },
        {
          "valueName": "sceneItems",
          "valueType": "Array<Object>",
          "valueDescription": "Array of scene item objects"
        }
      ]
    },
    {
      "description": "A scene item's enable state has changed.",
      "eventType": "SceneItemEnableStateChanged",
      "eventSubscription": "SceneItems",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        },
        {
          "valueName": "sceneItemEnabled",
          "valueType": "Boolean",
          "valueDescription": "Whether the scene item is enabled (visible)"
        }
      ]
    },
    {
      "description": "A scene item's lock state has changed.",
      "eventType": "SceneItemLockStateChanged",
      "eventSubscription": "SceneItems",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        },
        {
          "valueName": "sceneItemLocked",
          "valueType": "Boolean",
          "valueDescription": "Whether the scene item is locked"
        }
      ]
    },
    {
      "description": "A scene item has been selected in the Ui.",
      "eventType": "SceneItemSelected",
      "eventSubscription": "SceneItems",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene the item is in"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene the item is in"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        }
      ]
    },
    {
      "description": "The transform/crop of a scene item has changed.",
      "eventType": "SceneItemTransformChanged",
      "eventSubscription": "SceneItemTransformChanged",
      "complexity": 4,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scene items",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "The name of the scene the item is in"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "The UUID of the scene the item is in"
        },
        {
          "valueName": "sceneItemId",
          "valueType": "Number",
          "valueDescription": "Numeric ID of the scene item"
        },
        {
          "valueName": "sceneItemTransform",
          "valueType": "Object",
          "valueDescription": "New transform/crop info of the scene item"
        }
      ]
    },
    {
      "description": "A new scene has been created.",
      "eventType": "SceneCreated",
      "eventSubscription": "Scenes",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the new scene"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the new scene"
        },
        {
          "valueName": "isGroup",
          "valueType": "Boolean",
          "valueDescription": "Whether the new scene is a group"
        }
      ]
    },
    {
      "description": "A scene has been removed.",
      "eventType": "SceneRemoved",
      "eventSubscription": "Scenes",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the removed scene"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the removed scene"
        },
        {
          "valueName": "isGroup",
          "valueType": "Boolean",
          "valueDescription": "Whether the scene was a group"
        }
      ]
    },
    {
      "description": "The name of a scene has changed.",
      "eventType": "SceneNameChanged",
      "eventSubscription": "Scenes",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene"
        },
        {
          "valueName": "oldSceneName",
          "valueType": "String",
          "valueDescription": "Old name of the scene"
        },
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "New name of the scene"
        }
      ]
    },
    {
      "description": "The current program scene has changed.",
      "eventType": "CurrentProgramSceneChanged",
      "eventSubscription": "Scenes",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene that was switched to"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene that was switched to"
        }
      ]
    },
    {
      "description": "The current preview scene has changed.",
      "eventType": "CurrentPreviewSceneChanged",
      "eventSubscription": "Scenes",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "sceneName",
          "valueType": "String",
          "valueDescription": "Name of the scene that was switched to"
        },
        {
          "valueName": "sceneUuid",
          "valueType": "String",
          "valueDescription": "UUID of the scene that was switched to"
        }
      ]
    },
    {
      "description": "The list of scenes has changed.\n\nTODO: Make OBS fire this event when scenes are reordered.",
      "eventType": "SceneListChanged",
      "eventSubscription": "Scenes",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "scenes",
      "dataFields": [
        {
          "valueName": "scenes",
          "valueType": "Array<Object>",
          "valueDescription": "Updated array of scenes"
        }
      ]
    },
    {
      "description": "The current scene transition has changed.",
      "eventType": "CurrentSceneTransitionChanged",
      "eventSubscription": "Transitions",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "dataFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Name of the new transition"
        },
        {
          "valueName": "transitionUuid",
          "valueType": "String",
          "valueDescription": "UUID of the new transition"
        }
      ]
    },
    {
      "description": "The current scene transition duration has changed.",
      "eventType": "CurrentSceneTransitionDurationChanged",
      "eventSubscription": "Transitions",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "dataFields": [
        {
          "valueName": "transitionDuration",
          "valueType": "Number",
          "valueDescription": "Transition duration in milliseconds"
        }
      ]
    },
    {
      "description": "A scene transition has started.",
      "eventType": "SceneTransitionStarted",
      "eventSubscription": "Transitions",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "dataFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Scene transition name"
        },
        {
          "valueName": "transitionUuid",
          "valueType": "String",
          "valueDescription": "Scene transition UUID"
        }
      ]
    },
    {
      "description": "A scene transition has completed fully.\n\nNote: Does not appear to trigger when the transition is interrupted by the user.",
      "eventType": "SceneTransitionEnded",
      "eventSubscription": "Transitions",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "dataFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Scene transition name"
        },
        {
          "valueName": "transitionUuid",
          "valueType": "String",
          "valueDescription": "Scene transition UUID"
        }
      ]
    },
    {
      "description": "A scene transition's video has completed fully.\n\nUseful for stinger transitions to tell when the video *actually* ends.\n`SceneTransitionEnded` only signifies the cut point, not the completion of transition playback.\n\nNote: Appears to be called by every transition, regardless of relevance.",
      "eventType": "SceneTransitionVideoEnded",
      "eventSubscription": "Transitions",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "transitions",
      "dataFields": [
        {
          "valueName": "transitionName",
          "valueType": "String",
          "valueDescription": "Scene transition name"
        },
        {
          "valueName": "transitionUuid",
          "valueType": "String",
          "valueDescription": "Scene transition UUID"
        }
      ]
    },
    {
      "description": "Studio mode has been enabled or disabled.",
      "eventType": "StudioModeStateChanged",
      "eventSubscription": "Ui",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "ui",
      "dataFields": [
        {
          "valueName": "studioModeEnabled",
          "valueType": "Boolean",
          "valueDescription": "True == Enabled, False == Disabled"
        }
      ]
    },
    {
      "description": "A screenshot has been saved.\n\nNote: Triggered for the screenshot feature available in `Settings -> Hotkeys -> Screenshot Output` ONLY.\nApplications using `Get/SaveSourceScreenshot` should implement a `CustomEvent` if this kind of inter-client\ncommunication is desired.",
      "eventType": "ScreenshotSaved",
      "eventSubscription": "Ui",
      "complexity": 2,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.1.0",
      "category": "ui",
      "dataFields": [
        {
          "valueName": "savedScreenshotPath",
          "valueType": "String",
          "valueDescription": "Path of the saved image file"
        }
      ]
    },
    {
      "description": "An event has been emitted from a vendor.\n\nA vendor is a unique name registered by a third-party plugin or script, which allows for custom requests and events to be added to obs-websocket.\nIf a plugin or script implements vendor requests or events, documentation is expected to be provided with them.",
      "eventType": "VendorEvent",
      "eventSubscription": "Vendors",
      "complexity": 3,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "dataFields": [
        {
          "valueName": "vendorName",
          "valueType": "String",
          "valueDescription": "Name of the vendor emitting the event"
        },
        {
          "valueName": "eventType",
          "valueType": "String",
          "valueDescription": "Vendor-provided event typedef"
        },
        {
          "valueName": "eventData",
          "valueType": "Object",
          "valueDescription": "Vendor-provided event data. {} if event does not provide any data"
        }
      ]
    },
    {
      "description": "Custom event emitted by `BroadcastCustomEvent`.",
      "eventType": "CustomEvent",
      "eventSubscription": "General",
      "complexity": 1,
      "rpcVersion": "1",
      "deprecated": false,
      "initialVersion": "5.0.0",
      "category": "general",
      "dataFields": [
        {
          "valueName": "eventData",
          "valueType": "Object",
          "valueDescription": "Custom event data"
        }
      ]
    }
  ]
};
// </GENERATED-CODE-API>
