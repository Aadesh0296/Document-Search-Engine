import './App.css';
import UploadComponent from './FileUpload'
import SearchComponent from './SearchComponent'
function App() {
  return (
  <div className="App">
    <div className="header">
      <h1>
        Document Search Engine
      </h1>
    </div>
    <UploadComponent/> 
    <SearchComponent/> 
 </div>
  );
}

export default App;
