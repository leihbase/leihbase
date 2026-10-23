export type OpeningHoursRange = {
  from: string;
  to: string;
};

export type OpeningHoursDays = {
  [key: string]: OpeningHoursRange[];
};

export type OpeningHoursExcept = {
  dates: string[];
};

export type OpeningHours = {
  days: OpeningHoursDays;
  except: OpeningHoursExcept;
};
