export type DeleteMode = 'soft' | 'hard';

// diff между before и after
export type EventFieldDiff = {
  field: string;
  label: string;
  before: any;
  after: any;
};
