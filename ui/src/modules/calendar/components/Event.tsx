import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import {
  CalendarWrapper,
  Cell,
  ColumnHeader,
  Day,
  DayHeader,
  DayRow,
  Grid,
  Header,
  Presentation,
  Row,
  RowWrapper,
  WeekCol,
  WeekWrapper,
  WeekContainer,
  WeekHours,
  WeekData,
  AddEventBtn
} from '../styles';
import { IEvent } from '../types';
import { getDaysInMonth, extractDate, filterEvents } from '../utils';
import AddEvent from '../containers/AddEvent';
import { TYPES, WEEKS } from '../constants';
import Detail from './Detail';

type Props = {
  currentDate: Date;
  type: string;
  events: IEvent[];
  startTime: Date;
  endTime: Date;
  integrationId: string;
  queryParams: any;
};

type State = { isPopupVisible: boolean; selectedDate?: Date };

class Event extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isPopupVisible: false,
      selectedDate: new Date()
    };
  }

  onHideModal = (date?: Date) => {
    this.setState({
      isPopupVisible: !this.state.isPopupVisible,
      selectedDate: date
    });
  };

  renderHeader = (startTime?: Date) => {
    const dt = startTime && extractDate(startTime);

    return (
      <Header>
        {WEEKS.map((week, index) => {
          return (
            <ColumnHeader key={week}>
              {week}
              {dt && (
                <>
                  <br />
                  {new Date(dt.year, dt.month, dt.date + index).getDate()}
                </>
              )}
            </ColumnHeader>
          );
        })}
      </Header>
    );
  };

  renderEvents = (events: IEvent[], showHour: boolean) => {
    return events.map(event => {
      return <Detail key={event._id} event={event} showHour={showHour} />;
    });
  };

  addEventBtn = (day: Date) => {
    return (
      <AddEventBtn onClick={this.onHideModal.bind(this, day)}>
        <Icon icon="plus-circle" />
      </AddEventBtn>
    );
  };

  renderContent = (day: Date) => {
    const events = filterEvents(this.props.events, day);

    const currentDate = this.props.currentDate;
    const isSelectedDate =
      dayjs(currentDate).diff(day, 'day') === 0 &&
      new Date(currentDate).getDate() === day.getDate();

    return (
      <>
        <Day
          isSelectedDate={isSelectedDate}
          onClick={this.onHideModal.bind(this, day)}
        >
          {day.getDate()}
        </Day>

        {this.renderEvents(events, false)}
      </>
    );
  };

  generateDayData = () => {
    const { currentDate } = this.props;
    const events = filterEvents(this.props.events, currentDate);

    const renderRows = (isHour?: boolean) => {
      const data: any = [];

      for (let h = 0; h < 24; h++) {
        const hour = h.toString().length === 1 ? `0${h}` : h;

        data.push(
          <WeekData key={isHour ? h : `data-${h}`}>
            {isHour ? hour : this.addEventBtn(currentDate)}
          </WeekData>
        );
      }

      return data;
    };

    return (
      <WeekContainer>
        <WeekHours>{renderRows(true)}</WeekHours>
        <WeekWrapper>
          <WeekCol>
            {renderRows()}
            {this.renderEvents(events, true)}
          </WeekCol>
        </WeekWrapper>
      </WeekContainer>
    );
  };

  generateWeekData = () => {
    const data = (day?: Date, week?: string) => {
      const data: any = [];

      if (day && week) {
        for (let h = 0; h < 24; h++) {
          data.push(
            <WeekData key={`${week}-${day.toDateString()}-${h}`}>
              {this.addEventBtn(day)}
            </WeekData>
          );
        }
      } else {
        for (let h = 0; h < 24; h++) {
          data.push(
            <WeekData key={h}>
              {h.toString().length === 1 ? `0${h}` : h}
            </WeekData>
          );
        }
      }

      return data;
    };

    const { year, month, date } = extractDate(this.props.startTime);

    return (
      <WeekContainer>
        <WeekHours>{data()}</WeekHours>

        <WeekWrapper>
          {WEEKS.map((week, index) => {
            const day = new Date(year, month, date + index);
            const events = filterEvents(this.props.events, day);

            return (
              <WeekCol key={`week_${index}`}>
                {data(day, week)}
                {this.renderEvents(events, true)}
              </WeekCol>
            );
          })}
        </WeekWrapper>
      </WeekContainer>
    );
  };

  render() {
    const {
      startTime,
      endTime,
      integrationId,
      currentDate,
      type,
      queryParams
    } = this.props;

    const createForm = (
      <AddEvent
        startTime={startTime}
        endTime={endTime}
        queryParams={queryParams}
        integrationId={integrationId}
        isPopupVisible={this.state.isPopupVisible}
        onHideModal={this.onHideModal}
        selectedDate={this.state.selectedDate}
      />
    );

    if (type === TYPES.DAY) {
      return (
        <>
          <DayHeader>{dayjs(currentDate).format('MMM D')}</DayHeader>
          {this.generateDayData()}
          {createForm}
        </>
      );
    }

    if (type === TYPES.WEEK) {
      return (
        <div>
          <DayRow>
            <span>&nbsp;</span>
            {this.renderHeader(startTime)}
          </DayRow>
          {this.generateWeekData()}
          {createForm}
        </div>
      );
    }

    const { month, year } = extractDate(currentDate);
    const rows = getDaysInMonth(month, year);

    return (
      <CalendarWrapper>
        <Grid>
          {this.renderHeader()}
          <Presentation>
            {rows.map((days, index) => (
              <Row key={index}>
                <RowWrapper>
                  {days.map((day, dayIndex) => (
                    <Cell key={dayIndex}>{this.renderContent(day)}</Cell>
                  ))}
                </RowWrapper>
              </Row>
            ))}
          </Presentation>
        </Grid>
        {createForm}
      </CalendarWrapper>
    );
  }
}

export default Event;
