import { SIGN_FILES, ENCRYPT_FILES, CREATE_FILES, CREATE_FILES_SUCCESS, CREATE_FILES_ERROR } from "../constants";
import * as RNFS from "react-native-fs";

const initialState = {
  id: [],
  title: [],
  extension: [],
  note: []
};

function changeExtensionSign(OldExtension, id) {
  let length = id.length;
  while (length) {
    OldExtension[id[length]] = "sig";
    length--;
  }
  OldExtension[id[0]] = "sig";
  return OldExtension;
}

function changeExtensionEncrypt(OldExtension, id) {
  let length = id.length;
  while (length) {
    OldExtension[id[length]] = "enc";
    length--;
  }
  OldExtension[id[0]] = "enc";
  return OldExtension;
}

export function Files(state = initialState, action) {
  switch (action.type) {
    case SIGN_FILES:
      return {
        ...state,
        extension: changeExtensionSign(state.extension, action.payload)
      };
    case ENCRYPT_FILES:
      return {
        ...state,
        extension: changeExtensionEncrypt(state.extension, action.payload)
      };
    case CREATE_FILES:
      return {
        ...state
      };
    case CREATE_FILES_SUCCESS:
      let arrTitle = [], arrExtension = [], arrId = [], arrNote = [], arrPath = [];
      for (let i = 0; i < action.payload.length; i++) {
        if (action.payload[i].name === "") {
          arrTitle.push(action.payload[i].extension);
          arrExtension.push(action.payload[i].name);
        } else {
          arrTitle.push(action.payload[i].name);
          arrExtension.push(action.payload[i].extension);
        }
        arrId.push(i);
        arrNote.push(action.payload[i].mtime);
        arrPath.push(action.payload[i].path);
      }
      return {
          ...state,
          title: arrTitle,
          extension: arrExtension,
          id: arrId,
          note: arrNote
        };
    case CREATE_FILES_ERROR:
      return {
        ...state
      };
    default:
      return state;
  }
}