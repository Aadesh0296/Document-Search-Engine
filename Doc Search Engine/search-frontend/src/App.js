import './App.css';
import UploadComponent from './FileUpload';
import SearchComponent from './SearchComponent';

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>Document Search Engine</h1>
      </div>
      <UploadComponent /> 
      <SearchComponent /> 
      <footer className="footer">
        <p>
          Designed and Developed by Work With Aadesh | 
          Visit us at <a href="https://workwithaadesh.wordpress.com">Work With Aadesh</a> | 
          Email: <a href="mailto:workwithaadesh@gmail.com">workwithaadesh@gmail.com</a> | 
        </p>
      </footer>
    </div>
  );
}

export default App;
