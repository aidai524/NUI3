import type { ReactNode } from 'react';
import { Display, Eyebrow, Lead } from '@nui3/react';

export function PageHead({ eyebrow, title, lead, aside }: { eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; aside?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'space-between', alignItems: 'end', padding: '56px 0 36px' }}>
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Display size="s" style={{ marginTop: 14 }}>{title}</Display>
        {lead && <Lead style={{ marginTop: 14 }}>{lead}</Lead>}
      </div>
      {aside}
    </div>
  );
}
