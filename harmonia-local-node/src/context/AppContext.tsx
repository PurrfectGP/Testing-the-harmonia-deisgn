/**
 * AppContext - Global State Management for Parallax Forensic Lab
 * Uses Context-based State Machine with useReducer
 */

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export const Phase = {
  INTRO: 0,        // Magnetizing Swarm
  VISUAL: 1,       // Visual Calibration (Eye)
  PSYCHOMETRIC: 2, // Psychometric Analysis (Felix Terminal)
  BIOMETRIC: 3,    // Biometric Ingestion (Helix)
  FUSION: 4,       // Fusion Sequence (Transition)
  RESULTS: 5,      // Results Dashboard (Sealed Dossier)
} as const;

export type Phase = typeof Phase[keyof typeof Phase];

export const StationState = {
  LOCKED: 'locked',
  IDLE: 'idle',
  SCANNING: 'scanning',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
} as const;

export type StationState = typeof StationState[keyof typeof StationState];

interface UserData {
  visualFile?: File | null;
  psychometricResponses: Record<string, string>;
  biometricFile?: File | null;
}

interface CompatibilityResults {
  globalSynergyQuotient: number;
  visualScore: number;
  psychometricScore: number;
  biometricScore: number;
  radarData: number[];
  operationalDirective: string;
}

interface AppState {
  currentPhase: Phase;
  stationStates: Record<Phase, StationState>;
  userData: UserData;
  results: CompatibilityResults | null;
  isFusionActive: boolean;
  isScrollLocked: boolean;
}

// ============================================
// ACTIONS
// ============================================

type AppAction =
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'UNLOCK_STATION'; payload: Phase }
  | { type: 'UPDATE_STATION_STATE'; payload: { phase: Phase; state: StationState } }
  | { type: 'UPDATE_USER_DATA'; payload: Partial<UserData> }
  | { type: 'SET_RESULTS'; payload: CompatibilityResults }
  | { type: 'START_FUSION' }
  | { type: 'END_FUSION' }
  | { type: 'LOCK_SCROLL' }
  | { type: 'UNLOCK_SCROLL' }
  | { type: 'RESET_APP' };

// ============================================
// INITIAL STATE
// ============================================

const initialState: AppState = {
  currentPhase: Phase.INTRO,
  stationStates: {
    [Phase.INTRO]: StationState.IDLE,
    [Phase.VISUAL]: StationState.LOCKED,
    [Phase.PSYCHOMETRIC]: StationState.LOCKED,
    [Phase.BIOMETRIC]: StationState.LOCKED,
    [Phase.FUSION]: StationState.LOCKED,
    [Phase.RESULTS]: StationState.LOCKED,
  },
  userData: {
    visualFile: null,
    psychometricResponses: {},
    biometricFile: null,
  },
  results: null,
  isFusionActive: false,
  isScrollLocked: false,
};

// ============================================
// REDUCER
// ============================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };

    case 'UNLOCK_STATION':
      return {
        ...state,
        stationStates: {
          ...state.stationStates,
          [action.payload]: StationState.IDLE,
        },
      };

    case 'UPDATE_STATION_STATE':
      return {
        ...state,
        stationStates: {
          ...state.stationStates,
          [action.payload.phase]: action.payload.state,
        },
      };

    case 'UPDATE_USER_DATA':
      return {
        ...state,
        userData: {
          ...state.userData,
          ...action.payload,
        },
      };

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
      };

    case 'START_FUSION':
      return {
        ...state,
        isFusionActive: true,
        isScrollLocked: true,
      };

    case 'END_FUSION':
      return {
        ...state,
        isFusionActive: false,
        isScrollLocked: false,
        stationStates: {
          ...state.stationStates,
          [Phase.RESULTS]: StationState.IDLE,
        },
      };

    case 'LOCK_SCROLL':
      return {
        ...state,
        isScrollLocked: true,
      };

    case 'UNLOCK_SCROLL':
      return {
        ...state,
        isScrollLocked: false,
      };

    case 'RESET_APP':
      return initialState;

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  goToPhase: (phase: Phase) => void;
  completeStation: (phase: Phase) => void;
  startFusionSequence: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function to navigate to a phase
  const goToPhase = (phase: Phase) => {
    if (state.stationStates[phase] !== StationState.LOCKED) {
      dispatch({ type: 'SET_PHASE', payload: phase });
    }
  };

  // Helper function to mark a station as completed and unlock next
  const completeStation = (phase: Phase) => {
    dispatch({
      type: 'UPDATE_STATION_STATE',
      payload: { phase, state: StationState.COMPLETED },
    });

    // Unlock next station
    const nextPhase = (phase + 1) as Phase;
    if (nextPhase <= Phase.RESULTS) {
      dispatch({ type: 'UNLOCK_STATION', payload: nextPhase });
    }
  };

  // Helper function to start the fusion sequence
  const startFusionSequence = () => {
    dispatch({ type: 'START_FUSION' });

    // Generate mock results after fusion animation
    setTimeout(() => {
      const mockResults: CompatibilityResults = {
        globalSynergyQuotient: 87,
        visualScore: 92,
        psychometricScore: 85,
        biometricScore: 84,
        radarData: [92, 85, 84, 88, 90, 82],
        operationalDirective: 'Proceed with courtship. High synergy detected across all dimensions.',
      };
      dispatch({ type: 'SET_RESULTS', payload: mockResults });
      dispatch({ type: 'END_FUSION' });
      dispatch({ type: 'SET_PHASE', payload: Phase.RESULTS });
    }, 4000); // 4 second fusion animation
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        goToPhase,
        completeStation,
        startFusionSequence,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
