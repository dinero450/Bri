import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { IconContext } from "react-icons";
import './SearchBar.css';
import axios from "axios"
import { useNavigate } from 'react-router-dom';
export const SearchBar = ({ setResults }) => {
  const navigate = useNavigate();
  const [valueSearch, setValueSearch] = useState("");
  
  const handleChange = async (valueSearch) => {
    setValueSearch(valueSearch);
    //fetchData(value);
  }

  const searchData = async (valueSearch) =>{
    try { 
      const response = await axios.post('http://localhost:9200/medicamentos/_search', {
            size: 0,
            aggs: {
                paises: {
                    terms: {
                        field: 'pais.keyword',
                        size: 10
                    },
                    aggs: {
                        titulo_contiene_medicamento: {
                            filter: {
                                match: { titulo: valueSearch }
                            }
                        }
                    }
                }
            }
        });
      setResults(response.data.aggregations.paises.buckets)
      //console.log(valueSearch)     
      //console.log(response.data.aggregations.paises.buckets)
    //console.log(this.resultAxios)
    }catch(e) {
      console.log("Error",e)
    }
  }

  return (
    <div className="search-container">
      <div className='input-wrapper'>
        <IconContext.Provider value={{color:"gray", size:"1.75em"}}>
          <FiSearch id="search-icon" />
        </IconContext.Provider>
        <input 
          placeholder="Ingrese el medicamento" 
          value={valueSearch} 
          onChange={(e) => handleChange(e.target.value)}/>
      </div>
      <button onClick={() => searchData(valueSearch)} className='myButton'>Buscar</button>

    </div>
  );
};
