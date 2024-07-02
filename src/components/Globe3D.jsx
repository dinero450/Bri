import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { feature } from 'topojson-client';
import './Globe.css';
import Filters from './Filters';

const polygonsMaterial = new THREE.MeshLambertMaterial({ color: 'black', side: THREE.DoubleSide });
const globeMaterial = new THREE.MeshBasicMaterial();

const Globe3D = ({highlightedCountries}) => {
  const globeEl = useRef(null);
  const [landPolygons, setLandPolygons] = useState([]);
  const [hoverD, setHoverD] = useState();
   
  let colorScale = [
    "rgb(194, 0, 0)",
    "rgb(194, 0, 34)",
    "rgb(193, 0, 53)",
    "rgb(190, 0, 69)",
    "rgb(186, 0, 84)",
    "rgb(181, 0, 97)",
    "rgb(177, 0, 110)",
    "rgb(171, 0, 123)",
    "rgb(166, 0, 135)",
    "rgb(159, 0, 148)",
    "rgb(152, 0, 161)",
    "rgb(144, 0, 173)",
    "rgb(135, 0, 184)",
    "rgb(126, 0, 196)",
    "rgb(116, 0, 206)",
    "rgb(104, 0, 214)",
    "rgb(92, 0, 221)",
    "rgb(78, 0, 227)",
    "rgb(61, 0, 231)",
    "rgb(37, 7, 233)"
  ];
  
  highlightedCountries = highlightedCountries?.filter(p => p.titulo_contiene_medicamento.doc_count > 0).map(p => ({pais: p.key, count:p.titulo_contiene_medicamento.doc_count, color:null}) ).sort((a,b) => b.count - a.count)
  highlightedCountries?.forEach((pais, index) => {
    const colorIndex = index
    pais.color = colorScale[colorIndex]
  })
  useEffect(() => {
    // Fetch country boundaries
    fetch('/countries.json')
      .then(res => res.json())
      .then(countryTopo => {
        const countries = feature(countryTopo, countryTopo.objects.countries).features;
        setLandPolygons(countries); // Set the countries as the land polygons 
      })
      .catch(error => console.error('Error loading country data:', error));
  }, []);

  useEffect(() => {
    // Ensure globeEl.current is defined before accessing pointOfView
    if (globeEl.current) {
      globeEl.current.pointOfView({ altitude: 1.2 }); // Set initial altitude
    }
  }, []);
  const N = 30;
  const gData = [...Array(N).keys()].map(() => ({
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: 7 + Math.random() * 30,
    color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
  }));
 
  return (
    <div className="globe-container">
      <div className="filters">
        <h2>Filters</h2>
          <Filters />
      </div>
      <div id="globe">
        <Globe
          width={1200}
          height={900}
          ref={globeEl}
          backgroundColor="rgba(0,0,0,0)"
          showGlobe={true}
          globeMaterial={globeMaterial}
          //globeImageUrl={bg2}
          //backgroundImageUrl={bg2}
          //globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          showAtmosphere={true}
          atmosphereColor="black"
          atmosphereAltitude={0.03}

          polygonsData={landPolygons}
          polygonAltitude={d => d === hoverD ? 0.034 : 0.007}
          polygonStrokeColor={() => '#D3D3D3'}
          polygonCapMaterial={d => {
            
            const colorAsignado = highlightedCountries?.filter(p => p.pais == d.properties.name);
            const isHighlighted = highlightedCountries.some(p => p.pais == d.properties.name);
            console.log( colorAsignado[0]?.color)
            return new THREE.MeshLambertMaterial({
              color: isHighlighted ?  colorAsignado[0].color : 'gray', // Colorea los países resaltados en rojo
              side: THREE.DoubleSide,

            });
          }}
          polygonSideColor={() => '#D3D3D3'}
          onPolygonHover={setHoverD}
          polygonsTransitionDuration={300}

          htmlElementsData={gData}
          htmlElement={d => {
            const el = document.createElement('div');
            el.innerHTML = markerSvg;
            el.style.color = d.color;
            el.style.width = `${d.size}px`;

            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            el.onclick = () => console.info(d);
            return el;
          }}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<Globe3D />, document.getElementById('root'));

export default Globe3D;
