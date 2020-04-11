import React, { useState, useEffect } from 'react';
import 'rbx/index.css';
import { Button, Container, Title } from 'rbx';
import firebase from 'firebase/app';
import 'firebase/database';

var firebaseConfig = {
  apiKey: "AIzaSyCJBpNb61XxQJOZTx65ls4xYMAawIFN8m8",
  authDomain: "scheduler-394.firebaseapp.com",
  databaseURL: "https://scheduler-394.firebaseio.com",
  projectId: "scheduler-394",
  storageBucket: "scheduler-394.appspot.com",
  messagingSenderId: "253392573334",
  appId: "1:253392573334:web:db1f05c83e7da57bad83b7"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database().ref();

const Banner = ({ title }) => (
  <Title>{ title || '[loading...]' }</Title>
);

const terms = { F: 'Fall', W: 'Winter', S: 'Spring'};

const days = ['M', 'Tu', 'W', 'Th', 'F'];



const getCourseTerm = course => (
  terms[course.id.charAt(0)]
);

const getCourseNumber = course => (
  course.id.slice(1, 4)
)


const hasConflict = (course, selected) => (
  selected.some(selection => courseConflict(course, selection))
);

const daysOverlap = (days1, days2) => ( 
  days.some(day => days1.includes(day) && days2.includes(day))
);

const hoursOverlap = (hours1, hours2) => (
  Math.max(hours1.start, hours2.start) < Math.min(hours1.end, hours2.end)
);

const timeConflict = (course1, course2) => (
  daysOverlap(course1.days, course2.days) && hoursOverlap(course1.hours, course2.hours)
);

const courseConflict = (course1, course2) => (
  course1 !== course2
  && getCourseTerm(course1) === getCourseTerm(course2)
  && timeConflict(course1, course2)
);

const addCourseTimes = course => ({
  ...course,
  ...timeParts(course.meets)
});

const meetsPat = /^ *((?:M|Tu|W|Th|F)+) +(\d\d?):(\d\d) *[ -] *(\d\d?):(\d\d) *$/;

const timeParts = meets => {
  const [match, days, hh1, mm1, hh2, mm2] = meetsPat.exec(meets) || [];
  return !match ? {} : {
    days,
    hours: {
      start: hh1 * 60 + mm1 * 1,
      end: hh2 * 60 + mm2 * 1
    }
  };
};

const useSelection = () => {
  const [selected, setSelected] = React.useState([]);
  const toggle = (x) => {
    setSelected(selected.includes(x) ? selected.filter(y => y !== x) : [x].concat(selected))
  };
  return [ selected, toggle ];
};

const buttonColor = selected => (
  selected ? `button is-success is-selected` : 'button'
);

const TermSelector = ({ state }) => (
  <div className="field has-addons">
  { Object.values(terms)
      .map(value => 
        <button key={value}
          className={ buttonColor(value === state.term) }
          onClick={ () => state.setTerm(value) }
          >
          { value }
        </button>
      )
  }
  </div>
);

const moveCourse = course => {
  const meets = prompt('Enter new meeting data, in this format:', course.meets);
  if (!meets) return;
  const {days} = timeParts(meets);
  if (days) saveCourse(course, meets); 
  else moveCourse(course);
};

const saveCourse = (course, meets) => {
  db.child('courses').child(course.id).update({meets})
    .catch(error => alert(error));
};

const Course = ({ course, state }) => (
  <Button color={ buttonColor(state.selected.includes(course)) }
      onClick={ () => state.toggle(course) }
      disabled={ hasConflict(course, state.selected) }
      onDoubleClick={ () => moveCourse(course) }
      >
      { getCourseTerm(course) } CS { getCourseNumber(course) }: { course.title }
    </Button>
  );

const CourseList = ({ courses }) => {
  const [term, setTerm] = React.useState('Fall');
  const [selected, toggle] = useSelection();
  const termCourses = courses.filter(course => term === getCourseTerm(course));
 
  return (
    <React.Fragment>
      <TermSelector state={ { term, setTerm } } />
      <div className="buttons">
        { termCourses.map(course =>
           <Course key={ course.id } course={ course }
             state={ { selected, toggle } } />) }
      </div>
    </React.Fragment>
  );
};

const addScheduleTimes = schedule => ({
  title: schedule.title,
  courses: Object.values(schedule.courses).map(addCourseTimes)
});


const App = () => {
  const [schedule, setSchedule] = useState({ title: '', courses: [] });

  useEffect(() => {
    const handleData = snap => {
      if (snap.val()) setSchedule(addScheduleTimes(snap.val()));
    }
    db.on('value', handleData, error => alert(error));
    return () => { db.off('value', handleData); };
  }, []);

  return (
    <Container>
      <Banner title={ schedule.title } />
      <CourseList courses={ schedule.courses } />
    </Container>
);
};

export default App;