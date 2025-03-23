import { render, screen, fireEvent, act } from '../utils/test-utils';
import { DatePicker } from '@/components/date-picker';
import userEvent from '@testing-library/user-event';

describe('DatePicker', () => {
  it('should render with default state', () => {
    render(<DatePicker />);
    
    expect(screen.getByText('Pick a date')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should open calendar on click', async () => {
    render(<DatePicker />);
    
    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument(); // Calendar grid
  });

  it('should select a date and display it formatted', async () => {
    render(<DatePicker />);
    
    // Open the calendar
    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });
    
    // Select today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    const todayButton = screen.getByRole('button', { name: new RegExp(today.getDate().toString()) });
    await act(async () => {
      await userEvent.click(todayButton);
    });
    
    // Verify the selected date is displayed
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  it('should close calendar when clicking outside', async () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <DatePicker />
      </div>
    );
    
    // Open the calendar
    const button = screen.getByRole('button');
    await act(async () => {
      await userEvent.click(button);
    });
    
    // Calendar should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Click outside
    const outside = screen.getByTestId('outside');
    await act(async () => {
      await userEvent.click(outside);
    });
    
    // Calendar should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
}); 