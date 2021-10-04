import { takeEvery, put, fork, select } from 'redux-saga/effects'
import { actions, FetchMetricData, IMetric } from './reducer';
import { PayloadAction } from 'redux-starter-kit';
import { IState } from '../../store';
import { client } from './Metrics';

const getMetrics = (state: IState) => state.metrics.metrics;

function* normalizeData(action: PayloadAction<IMetric>) {
    const { metric, at, value } = action.payload;
    const getLatestvalue = (state: IState) => state.metrics.latestValue;
    let data = yield select(getMetrics);
    const oldlatestValue = yield select(getLatestvalue)
    const hours = new Date(at).getHours() % 12 || 12;
    const minutes = new Date(at).getMinutes()
    const timeAt = `${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}`
    data = {
        ...data,
        [at]: {
            ...data[at],
            [metric]: value,
            at: timeAt,
        },
    };
    const latestValue = {
        ...oldlatestValue,
        [metric]: value
    }
    yield put({ type: actions.singleMetricsDataReceived.type, metrics: data, latestValue })
    yield put(actions.singleMetricsDataReceived({ metrics: data, latestValue }))
}

function* combine(list: IMetric[]) {
    let data = yield select(getMetrics);
    list.map(item => {
        const { metric, at, value } = item;
        const hours = new Date(at).getHours() % 12 || 12;
        const minutes = new Date(at).getMinutes()
        const timeAt = `${("0" + hours).slice(-2)}:${("0" + minutes).slice(-2)}`
        data = {
            ...data,
            [at]: {
                ...data[at],
                [metric]: value,
                at: timeAt,
            },
        }
        return null;
    })
    yield put(actions.multipleMetricsDataReceived({ metrics: data }))
}

function* fetchLast30MinsData(action: PayloadAction<FetchMetricData>) {
    const { metricName } = action.payload;
    const thirtyMinAgo = new Date(new Date().getTime() - 30 * 60000).getTime()
    const { data } = yield client.query(`
    query($metricName: String!, $after: Timestamp) {
        getMeasurements(input: { metricName: $metricName, after: $after }) {
            at
            metric
            value
            unit
        }
    }`, {
        metricName,
        after: thirtyMinAgo
    }).toPromise();
    yield fork(combine, data.getMeasurements)
}

export function* watchForFetch() {
    yield takeEvery(actions.fetchedLastHalfHour.type, fetchLast30MinsData);
    yield takeEvery(actions.fetchedSingleMetric.type, normalizeData);
}

export function* watchForLiveUpdates() {
    yield takeEvery(actions.metricNamesSelected.type, fetchLast30MinsData);
}
