import React from 'react';
import OriginalButton from '../../components/button';

export default function Button() {
  return <>
    <button type='button'>Replaced Button</button>
    <OriginalButton />
  </>
}