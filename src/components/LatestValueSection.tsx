import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IState } from '../store';
import { Grid, CardContent, Typography, Card, CardHeader } from '@material-ui/core';
import { useSubscription, useQuery } from 'urql';
import { actions } from '../Features/Metrics/reducer';

interface ILatestValueSectionProps {
    selectedMetrics: string[];
}

interface IValueCardProps {
    metricName: string;
    currentValue: number;
}

const ValueCard: React.FC<IValueCardProps> = ({ metricName, currentValue }) => {
    const [value, setValue] = useState(currentValue);
    const [result] = useQuery({
        query: `query ($metricName: String!) {
            getLastKnownMeasurement(metricName:$metricName){
              metric
              value
              at
              unit
            }
          }`,
        variables: {
            metricName
        }
    });
    const { data } = result;
    useEffect(() => {
        setValue(data ? data.getLastKnownMeasurement.value : 0)
    }, [data])
    return <Grid item md={5} xs={6}>
        <Card elevation={2}>
            <CardHeader title={metricName} />
            <CardContent>
                <Typography variant="h3">
                    {currentValue ? currentValue : value}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
}


const getLatestValues = (state: IState) => {
    return state.metrics.latestValue;
}

interface NewMeasurement {
    newMeasurement: {
        at: string;
        metric: string;
        value: number;
        unit: string;
    }
}

const LatestValueSection: React.FC<ILatestValueSectionProps> = ({ selectedMetrics }) => {
    const latestValue = useSelector(getLatestValues);
    const dispatch = useDispatch();
    const [result] = useSubscription<NewMeasurement>({
        query: `
        subscription {
            newMeasurement {
                at
                metric
                value
                unit
            }
        }`,
        pause: selectedMetrics.length === 0
    })
    const { data } = result;

    useEffect(() => {
        data && dispatch(actions.fetchedSingleMetric(data.newMeasurement))
    }, [data, dispatch])

    return <>
        {
            selectedMetrics.map((metric) => (
                <ValueCard key={metric}
                    metricName={metric}
                    currentValue={latestValue[metric]}
                />
            ))
        }
    </>
}

export default LatestValueSection