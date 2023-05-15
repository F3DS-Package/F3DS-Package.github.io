import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Fortran based Software',
    image: require('@site/static/img/feature_fortran.png').default,
    description: (
      <>
        Fortran is the language of choice for many computational fluid mechanics professionals. This software is designed to take full advantage of the modern features of this lovely language.
      </>
    ),
  },
  {
    title: 'Versatile Framework',
    image: require('@site/static/img/feature_framework.png').default,
    description: (
      <>
        F3DS Package provides a versatile framework for building fluid dynamics solvers called F3DS Framework.
      </>
    ),
  },
  {
    title: 'Ready for Simulation',
    image: require('@site/static/img/feature_simulation.png').default,
    description: (
      <>
        F3DS Package has included simulation solvers such as compressive and multiphase flow. These solvers, called F3DS Collection, are made by F3DS Framework.
      </>
    ),
  },
];

function Feature({image, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={image} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
