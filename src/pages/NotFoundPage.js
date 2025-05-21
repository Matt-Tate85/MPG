import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { errorText, commonText } from '../data/text';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>{errorText.notFound.title} - {commonText.appName}</title>
        <meta name="description" content={errorText.notFound.message} />
      </Helmet>
      
      <div className="error-page-container">
        <div className="error-content">
          <h2>{errorText.notFound.title}</h2>
          <p>{errorText.notFound.message}</p>
          
          <Link to="/">
            <Button variant="primary">
              {errorText.notFound.action}
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
