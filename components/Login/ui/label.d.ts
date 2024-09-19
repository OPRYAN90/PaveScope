// label.d.ts
declare module 'components/Login/ui/label' {
    import { FC } from 'react';
  
    interface LabelProps {
      htmlFor?: string;
      className?: string;
    }
  
    const Label: FC<LabelProps>;
    export { Label };
  }