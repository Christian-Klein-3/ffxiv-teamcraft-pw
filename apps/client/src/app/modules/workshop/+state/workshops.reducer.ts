import { WorkshopsAction, WorkshopsActionTypes } from './workshops.actions';
import { Workshop } from '../../../model/other/workshop';

/**
 * Interface for the 'Workshops' data used in
 *  - WorkshopsState, and
 *  - workshopsReducer
 *
 *  Note: replace if already defined in another module
 */

export interface WorkshopsState {
  workshops: Workshop[];
  selectedId?: string; // which Workshop record has been selected
  workshopsConnected: boolean;
}

export const initialState: WorkshopsState = {
  workshops: [],
  workshopsConnected: false,
};

export function workshopsReducer(
  state: WorkshopsState = initialState,
  action: WorkshopsAction
): WorkshopsState {
  switch (action.type) {
    case WorkshopsActionTypes.MyWorkshopsLoaded: {
      state = {
        ...state,
        workshops: [
          ...action.payload
        ],
        workshopsConnected: true
      };
      break;
    }

    case WorkshopsActionTypes.UpdateWorkshopIndex: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.map(list => list.$key === action.payload.$key ? action.payload : list)
        ]
      };
      break;
    }

    case WorkshopsActionTypes.DeleteWorkshop: {
      state = {
        ...state,
        workshops: [
          ...state.workshops.filter(list => list.$key !== action.key)
        ]
      };
      break;
    }

    case WorkshopsActionTypes.SelectWorkshop: {
      state = {
        ...state,
        selectedId: action.key
      };
    }
  }
  return state;
}