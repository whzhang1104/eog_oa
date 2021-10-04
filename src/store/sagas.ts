import { spawn } from 'redux-saga/effects';
import weatherSaga from '../Features/Weather/saga';
import { watchForFetch, watchForLiveUpdates } from '../Features/Metrics/saga';

export default function* root() {
  yield spawn(weatherSaga);
  yield spawn(watchForFetch);
  yield spawn(watchForLiveUpdates);
}
