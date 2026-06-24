import { useReducer } from 'react';
import type { Dispatch } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { appReducer, initialAppState } from './appReducer';
import type { AppAction, AppState, GameId, GameResult, PlayerCount } from './appTypes';
import { FindMatchGame } from '../games/find-match/FindMatchGame';
import { GamesScreen } from '../screens/GamesScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { SetupScreen } from '../screens/SetupScreen';

type RoutedAppProps = {
  state: AppState;
  dispatch: Dispatch<AppAction>;
};

function RoutedApp({ state, dispatch }: RoutedAppProps) {
  const navigate = useNavigate();

  function handleSelectPlayerCount(playerCount: PlayerCount): void {
    dispatch({ type: 'selectPlayerCount', playerCount });
    navigate('/games');
  }

  function handleSelectGame(gameId: GameId): void {
    dispatch({ type: 'selectGame', gameId });
    navigate('/game/find-match');
  }

  function handleCompleteGame(result: GameResult): void {
    dispatch({ type: 'completeGame', result });
    navigate('/result');
  }

  function handleContinueFromResult(): void {
    dispatch({ type: 'continueFromResult' });
    navigate('/games');
  }

  function handleExitGame(): void {
    dispatch({ type: 'exitGame' });
    navigate('/games');
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/setup" replace />} />
      <Route path="/setup" element={<SetupScreen onSelectPlayerCount={handleSelectPlayerCount} />} />
      <Route
        path="/games"
        element={
          state.playerCount ? (
            <GamesScreen
              players={state.players}
              sessionScores={state.sessionScores}
              onSelectGame={handleSelectGame}
            />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
      <Route
        path="/game/find-match"
        element={
          state.playerCount && state.selectedGameId === 'find-match' ? (
            <FindMatchGame
              players={state.players}
              onComplete={handleCompleteGame}
              onExit={handleExitGame}
            />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
      <Route
        path="/result"
        element={
          state.result ? (
            <ResultScreen
              players={state.players}
              result={state.result}
              onContinue={handleContinueFromResult}
            />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/setup" replace />} />
    </Routes>
  );
}

export function App() {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  return (
    <BrowserRouter>
      <RoutedApp state={state} dispatch={dispatch} />
    </BrowserRouter>
  );
}
