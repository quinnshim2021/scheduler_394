import React from 'react';
import 'rbx/index.css';
import { Button } from 'rbx';
import firebase from '../../shared/firebase.js';
import { getCourseNumber, getCourseTerm, hasConflict } from './time.js';


const db = firebase.database().ref();


const buttonColor = selected => (
    selected ? `button is-success is-selected` : 'button'
  );

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
    
    

const Course = ({ course, state, user }) => (
    <Button color={ buttonColor(state.selected.includes(course)) }
      onClick={ () => state.toggle(course) }
      onDoubleClick={ user ? () => moveCourse(course) : null }
      disabled={ hasConflict(course, state.selected) }
      >
      { getCourseTerm(course) } CS { getCourseNumber(course) }: { course.title }
    </Button>
  );

  
export default Course;