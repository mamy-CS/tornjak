import { 
    GLOBAL_SERVER_SELECTED, 
    GLOBAL_ENTRIES_LIST, 
    GLOBAL_AGENTS_LIST, 
    GLOBAL_SERVER_INFO } from './types';


export function serverSelected(globalServerSelected) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }   
}

export function serverInfoUpdate(globalServerInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_INFO,
            payload: globalServerInfo
        });
    }   
}

export function entriesListUpdate(globalentriesList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_ENTRIES_LIST,
            payload: globalentriesList
        });
    }   
}

export function agentsListUpdate(globalagentsList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_LIST,
            payload: globalagentsList
        });
    }   
}