import React from 'react';
import { Provider, createClient, defaultExchanges, subscriptionExchange } from 'urql';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Grid } from '@material-ui/core';
import MetricSelector from '../../components/MetricSelector';
import { useSelector } from 'react-redux';
import { IState } from '../../store';
import ChartGraph from '../../components/ChartGraph';
import LatestValueSection from '../../components/LatestValueSection';

const subscriptionClient = new SubscriptionClient(
    `ws://react.eogresources.com/graphql`,
    {
        reconnect: true,
    }
)

export const client = createClient({
    url: `https://react.eogresources.com/graphql`,
    exchanges: [
        ...defaultExchanges,
        subscriptionExchange({
            forwardSubscription: (operation) => subscriptionClient.request(operation)
        })
    ]
})

export default () => {
    return <Provider value={client}>
        <Metrics />
    </Provider>
}

const getSelectedMetrics = (state: IState) => state.metrics.selectedMetrics;

const Metrics = () => {
    const selectedMetrics = useSelector(getSelectedMetrics);
    return <Grid container>
        <Grid container item xs={12} spacing={4}>
            <Grid item container spacing={2} direction='row-reverse'>
                <Grid item xs={12} md={6} lg={5}>
                    <MetricSelector />
                </Grid>
                <Grid item lg={7} md={6} xs={12}>
                    <Grid container spacing={2}>
                        <LatestValueSection selectedMetrics={selectedMetrics} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item container xs={12} justify='center' alignItems='center'>
                <ChartGraph selectedMetrics={selectedMetrics} />
            </Grid>
        </Grid>
    </Grid>
}