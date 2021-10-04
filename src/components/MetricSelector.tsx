import React, { useState, useEffect } from 'react';
import Select, { OptionTypeBase, OptionsType, ValueType, ActionMeta } from 'react-select';
import { useQuery } from 'urql';
import { useDispatch } from 'react-redux';
import { actions } from '../Features/Metrics/reducer';

const query = `
    query {
        getMetrics
    }
`;

interface Option extends OptionTypeBase {
  label: string;
  value: string;
}

const MetricSelector: React.FC = () => {
  const [result] = useQuery({
    query,
  });
  const dispatch = useDispatch();
  const [options, setOptions] = useState<OptionsType<Option>>([]);
  const { data, error } = result;

  const onChange = (selected: ValueType<Option, boolean>, action: ActionMeta<Option>) => {
    const selectedMetrics = selected ? selected.map((item: Option) => item.value) : [];
    dispatch(actions.metricNamesSelected({ selectedMetrics, metricName: action.option && action.option.value }));
  };

  useEffect(() => {
    if (error) {
      return;
    }
    if (!data) return;
    const { getMetrics } = data;
    setOptions(getMetrics.map((option: string) => ({ label: option, value: option })));
  }, [dispatch, data, error]);

  return <Select name="metricSelect" options={options} isMulti closeMenuOnSelect={false} onChange={onChange} />;
};

export default MetricSelector;
