import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import Label from 'modules/common/components/form/Label';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Select from 'react-select-plus';
import { CalendarController, SidebarWrapper } from '../styles';
import { ICalendar } from '../types';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  typeOnChange: ({ value, label }: { value: string; label: string }) => void;
  type: string;
  calendars: ICalendar[];
  history: any;
  queryParams: any;
};

type State = {
  calendarIds: string[];
};

class LeftSidebar extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      calendarIds: []
    };
  }

  componentDidMount() {
    const { queryParams, calendars, history } = this.props;

    if (!queryParams.calendarIds) {
      const calendarIds = calendars.map(c => c.providerCalendarId);

      this.setState({ calendarIds });
      router.setParams(history, { calendarIds: calendarIds.toString() }, true);
    } else {
      this.setState({ calendarIds: queryParams.calendarIds.split(',') });
    }
  }

  renderOptions = (list: string[]) => {
    return list.map(item => ({ value: item, label: item.toUpperCase() }));
  };

  onChange = (increment: boolean) => {
    const { currentDate, type, dateOnChange } = this.props;

    let date: any = currentDate;

    if (type === 'month') {
      const month = currentDate.getMonth();
      date = dayjs(currentDate).set('month', increment ? month + 1 : month - 1);
    }

    dateOnChange(new Date(date));
  };

  toggleCheckbox = (calendarId, e: React.FormEvent<HTMLElement>) => {
    const checked = (e.target as HTMLInputElement).checked;
    const calendarIds = this.state.calendarIds;

    if (checked) {
      calendarIds.push(calendarId);
    } else {
      const index = calendarIds.indexOf(calendarId);
      calendarIds.splice(index, 1);
    }

    this.setState({ calendarIds });

    router.setParams(this.props.history, {
      calendarIds: calendarIds.toString()
    });
  };

  render() {
    const {
      type,
      typeOnChange,
      currentDate,
      dateOnChange,
      calendars
    } = this.props;
    const { calendarIds } = this.state;

    return (
      <Sidebar>
        <SidebarWrapper>
          <FormGroup>
            <CalendarController>
              <Icon
                icon="angle-left"
                onClick={this.onChange.bind(this, false)}
              />
              <Icon
                icon="angle-right"
                onClick={this.onChange.bind(this, true)}
              />
              <Label uppercase={true}>
                {dayjs(currentDate).format('MMMM, YYYY')}
              </Label>
            </CalendarController>
          </FormGroup>
          <FormGroup>
            <Select
              isRequired={true}
              value={type}
              onChange={typeOnChange}
              options={this.renderOptions(['day', 'week', 'month'])}
              clearable={false}
            />
          </FormGroup>

          <FormGroup>
            <Datetime
              inputProps={{ placeholder: 'Click to select a date' }}
              dateFormat="YYYY/MM/DD"
              timeFormat="HH:mm"
              closeOnSelect={true}
              utc={true}
              input={false}
              value={currentDate}
              onChange={dateOnChange}
              defaultValue={dayjs()
                .startOf('day')
                .add(12, 'hour')
                .format('YYYY-MM-DD HH:mm:ss')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Calendars</ControlLabel>
            <br />
            <br />

            {calendars.map(calendar => {
              const calendarId = calendar.providerCalendarId;

              return (
                <div key={calendar._id}>
                  <FormControl
                    key={calendar._id}
                    className="toggle-message"
                    componentClass="checkbox"
                    onChange={this.toggleCheckbox.bind(this, calendarId)}
                    checked={calendarIds.includes(calendarId)}
                  >
                    {calendar.name}
                  </FormControl>
                </div>
              );
            })}
          </FormGroup>
        </SidebarWrapper>
      </Sidebar>
    );
  }
}

export default LeftSidebar;