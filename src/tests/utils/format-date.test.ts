import { getValidDate, humanReadableDate } from '@/utils/format-date';

describe('getValidDate', () => {
  it('should handle dates with milliseconds correctly', () => {
    const date = '2024-03-05.1';
    const result = getValidDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2); // March is 2 (0-based)
    expect(result.getDate()).toBe(5);
  });

  it('should handle dates without milliseconds', () => {
    const date = '2024-03-05';
    const result = getValidDate(date);
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(5);
  });
});

describe('humanReadableDate', () => {
  it('should format date in human readable format', () => {
    const date = '2024-03-05';
    const result = humanReadableDate(date);
    expect(result).toBe('Tuesday, March 5, 2024');
  });

  it('should handle dates with milliseconds', () => {
    const date = '2024-03-05.1';
    const result = humanReadableDate(date);
    expect(result).toBe('Tuesday, March 5, 2024');
  });

  it('should handle different dates correctly', () => {
    const date = '2023-12-25';
    const result = humanReadableDate(date);
    expect(result).toBe('Monday, December 25, 2023');
  });
}); 