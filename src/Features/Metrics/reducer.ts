import { createSlice, PayloadAction } from 'redux-starter-kit';

export interface MetricsType {
    metrics: any;
    latestValue: {
        [key: string]: number
    },
    selectedMetrics: string[];
}

export interface MetricSelectPayload {
    selectedMetrics: string[];
    metricName?: string;
}

export interface MetricsWithLatest {
    metrics: any;
    latestValue: {
        [key: string]: number
    }
}

export interface MetricsPayload {
    metrics: any;
}

export interface IMetric {
    metric: string;
    at: string;
    value: number;
    unit: string;
}

export interface FetchMetricData {
    metricName?: string;
    data: any;
}

const initialState: MetricsType = {
    selectedMetrics: [],
    metrics: {},
    latestValue: {},
};

const slice = createSlice({
    initialState,
    name: 'metricsReducer',
    reducers: {
        singleMetricsDataReceived: (state, action: PayloadAction<MetricsWithLatest>) => {
            const { metrics, latestValue } = action.payload;
            return {
                ...state,
                metrics,
                latestValue
            }
        },
        multipleMetricsDataReceived: (state, action: PayloadAction<MetricsPayload>) => {
            const { metrics } = action.payload;
            return {
                ...state,
                metrics,
            };
        },
        metricNamesSelected: (state, action: PayloadAction<MetricSelectPayload>) => {
            const { selectedMetrics } = action.payload;
            return {
                ...state,
                selectedMetrics
            }
        },
        startLiveUpdates: (state, action: PayloadAction) => state,
        fetchedLastHalfHour: (state, action: PayloadAction<FetchMetricData>) => state,
        fetchedSingleMetric: (state, action: PayloadAction<IMetric>) => state
    }
})

export const { reducer, actions } = slice;