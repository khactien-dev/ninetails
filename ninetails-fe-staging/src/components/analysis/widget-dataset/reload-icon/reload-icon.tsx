import React from 'react';

interface IProps {
  fill?: string;
}

export const ReloadIcon: React.FC<IProps> = ({ fill }) => {
  return (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_2818_8548)">
        <path
          d="M15.833 2.66699V6.66699H11.833"
          stroke={fill ?? '#57BA00'}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M1.16699 13.333V9.33301H5.16699"
          stroke={fill ?? '#57BA00'}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M2.84033 6.00038C3.17844 5.0449 3.75308 4.19064 4.51064 3.51732C5.26819 2.844 6.18397 2.37355 7.17252 2.14988C8.16106 1.92621 9.19016 1.9566 10.1638 2.23823C11.1374 2.51985 12.0238 3.04352 12.7403 3.76038L15.8337 6.66704M1.16699 9.33371L4.26033 12.2404C4.97682 12.9572 5.86324 13.4809 6.83687 13.7625C7.81049 14.0441 8.83959 14.0745 9.82813 13.8509C10.8167 13.6272 11.7325 13.1568 12.49 12.4834C13.2476 11.8101 13.8222 10.9559 14.1603 10.0004"
          stroke={fill ?? '#57BA00'}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2818_8548">
          <rect width="16" height="16" fill="white" transform="translate(0.5)" />
        </clipPath>
      </defs>
    </svg>
  );
};
