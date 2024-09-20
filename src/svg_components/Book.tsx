import * as React from 'react';
import { SVGProps } from 'react';

function SvgBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 24 24" {...props}>
        <path
            stroke={props.stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2 20V4.963a11 11 0 0 1 9 0V20a11 11 0 0 0-9 0zM13 4.963V20a11 11 0 0 1 9 0V4.963a11 11 0 0 0-9 0z"
        />
    </svg>
  );
}
export default SvgBook;
