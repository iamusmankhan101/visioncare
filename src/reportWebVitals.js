const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    try {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }).catch(() => {
        // Fallback if web-vitals is not available
        console.log('Web vitals not available');
      });
    } catch (error) {
      console.log('Web vitals not available');
    }
  }
};

export default reportWebVitals;
