import { numberToCurrency } from '@/utils/number-to-currency';

describe('numberToCurrency', () => {
  it('should format positive numbers correctly', () => {
    expect(numberToCurrency(1234.56)).toBe('R$ 1.234,56');
    expect(numberToCurrency(1000000)).toBe('R$ 1.000.000,00');
    expect(numberToCurrency(0.99)).toBe('R$ 0,99');
  });

  it('should handle zero correctly', () => {
    expect(numberToCurrency(0)).toBe('R$ 0,00');
  });

  it('should handle undefined/null values', () => {
    expect(numberToCurrency(null as unknown as number)).toBe('R$ 0,00');
    expect(numberToCurrency(undefined as unknown as number)).toBe('R$ 0,00');
  });

  it('should handle negative numbers', () => {
    expect(numberToCurrency(-1234.56)).toBe('-R$ 1.234,56');
    expect(numberToCurrency(-0.99)).toBe('-R$ 0,99');
  });
}); 