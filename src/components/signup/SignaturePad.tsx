'use client';

import React, { forwardRef } from 'react';
import SignatureCanvasLib from 'react-signature-canvas';

export type SignaturePadRef = SignatureCanvasLib | null;

const SignaturePad = forwardRef<SignatureCanvasLib, React.ComponentProps<typeof SignatureCanvasLib>>(
  function SignaturePad(props, ref) {
    return <SignatureCanvasLib ref={ref} {...props} />;
  },
);

export default SignaturePad;
