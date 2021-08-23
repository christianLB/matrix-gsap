import React, {useState, useEffect} from 'react';
import gsap from 'gsap';

export const rnd = (max) => {
    return Math.floor(Math.random() * max + 1);
}

const getRandomChar = () => {
    const sample = 'abcdefghijklmnopqrstuvwxyz0123456789!"&%=/|¬°[]{}+*~-_¡`;:       '.split('');
    const index = Math.floor(Math.random() * sample.length);
    return sample[index];
}

const getNewList = list => {
  let cant = rnd(list.length / 2); 

  [...Array(cant)].map(() => {
    list[rnd(list.length)] = getRandomChar();
  });
  return list;
}


const Col = () => {
    let digits = 100;
    let col = [...Array(digits)].map(() => getRandomChar());
    let [list, setList] = useState(col);
    let timer1 = null;

    useEffect(
      () => {
          timer1 = setTimeout(() => {
            setList([...getNewList(list)]); 
          },    
          Math.floor(Math.random() * 10000))
        return () => {
          clearTimeout(timer1)
        }
      },
      [list] 
    )
    

    return (
      <div className="col">
        {list.map((c, i) => {
          return <span key={i}>{c}</span>
        })}
      </div>
    );
}

export default Col;