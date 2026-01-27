export type DeleteMode = 'soft' | 'hard';

export type EventFieldDiff = {
  field: string;
  label: string;
  before: any;
  after: any;
};
