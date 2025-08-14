import React from 'react';

interface RangeProps {
  label?: string;
  tooltip?: string;
  prefix?: string;
  values: number[];
  setValues: (values: number[]) => void;
  min: number;
  max: number;
  step?: number;
}

const Range: React.FC<RangeProps> = ({
  label,
  tooltip,
  prefix = '',
  values,
  setValues,
  min,
  max,
  step = 1
}) => {
  const handleChange = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {tooltip && (
            <span className="text-xs text-gray-500" title={tooltip}>
              ⓘ
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={values[0]}
            onChange={(e) => handleChange(0, Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>{prefix}{values[0]}</span>
          <span>-</span>
          <span>{prefix}{values[1]}</span>
        </div>
      </div>
      <div className="flex-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={values[1]}
          onChange={(e) => handleChange(1, Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Range; 