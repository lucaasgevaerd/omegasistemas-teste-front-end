import { useEffect, useState } from "react";
import axios from "axios";
import Select from 'react-select';

interface State {
  id: number;
  sigla: string;
  nome: string;
}

interface CovidData {
  uf: string;
  state: string;
  cases: number;
  deaths: number;
  suspects: number;
  refuses: number;
  datetime: string;
}

function App() {
  const [states, setStates] = useState<State[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [covidData, setCovidData] = useState<CovidData[]>([]);
  const [stateWithMostCases, setStateWithMostCases] = useState<CovidData | null>(null);
  const [stateWithMostDeaths, setStateWithMostDeaths] = useState<CovidData | null>(null);
  const [stateWithMostSuspects, setStateWithMostSuspects] = useState<CovidData | null>(null);

  const [showCases, setShowCases] = useState(false);
  const [showDeaths, setShowDeaths] = useState(false);
  const [showSuspects, setShowSuspects] = useState(false);

  const [selectedOption, setSelectedOption] = useState<{ value: string, label: string } | null>(null);

  useEffect(() => {
    const fetchDados = async () => {
      const resultStates = await axios(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome',
      );

      const resultCovid = await axios(
        'https://covid19-brazil-api.now.sh/api/report/v1',
      );

      const covidData = resultCovid.data.data;
      const initialState = covidData.length > 0 ? covidData[0] : { cases: 0, deaths: 0, suspects: 0 };

      setStates(resultStates.data);
      setCovidData(covidData);
      setStateWithMostCases(covidData.reduce((prev, current) => (prev.cases > current.cases) ? prev : current, initialState));
      setStateWithMostDeaths(covidData.reduce((prev, current) => (prev.deaths > current.deaths) ? prev : current, initialState));
      setStateWithMostSuspects(covidData.reduce((prev, current) => (prev.suspects > current.suspects) ? prev : current, initialState));
    };

    fetchDados();
  }, []);

  const handleSelectChange = (selectedOption: { value: string, label: string } | null) => {
    setSelectedState(selectedOption?.value || '');
    setSelectedOption(selectedOption);
  };

  const stateCovid = covidData.find(data => data.uf === selectedState);

  const flagsPerState: Record<string, string> = {
    AC: 'acre.svg',
    AL: 'alagoas.svg',
    AP: 'amapa.svg',
    AM: 'amazonas.svg',
    BA: 'bahia.svg',
    CE: 'ceara.svg',
    DF: 'distrito-federal.svg',
    ES: 'espirito-santo.svg',
    GO: 'goias.svg',
    MA: 'maranhao.svg',
    MT: 'mato-grosso.svg',
    MS: 'mato-grosso-do-sul.svg',
    MG: 'minas-gerais.svg',
    PA: 'para.svg',
    PB: 'paraiba.svg',
    PR: 'parana.svg',
    PE: 'pernambuco.svg',
    PI: 'piaui.svg',
    RJ: 'rio-de-janeiro.svg',
    RN: 'rio-grande-do-norte.svg',
    RS: 'rio-grande-do-sul.svg',
    RO: 'rondonia.svg',
    RR: 'roraima.svg',
    SC: 'santa-catarina.svg',
    SP: 'sao-paulo.svg',
    SE: 'sergipe.svg',
    TO: 'tocantins.svg',
  };

  const options = states.map(state => ({ value: state.sigla, label: state.nome }));

  return (
    <>
      <div className="flex p-4 tablet:p-8 monitor:p-12 justify-center h-screen bg-cover bg-center" style={{ backgroundImage: `url(jpgs/bg-covid.jpg)` }}>
        <div className="w-full max-w-screen-desktop">

          <h1 className="text-center text-gray-500 text-xl tablet:text-2xl monitor:text-3xl font-bold mb-4 tablet:mb-6 monitor:mb-8">COVID-19 no Brasil</h1>

          <Select
            options={options}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder="Selecione o estado"
            isClearable
            className="shadow-md text-base tablet:text-lg"
          />

          {stateCovid && (
            <div className="mt-5 bg-white shadow-md overflow-hidden rounded-md tablet:flex">
              <div className="px-4 py-5 flex items-center tablet:px-8 monitor:px-10 tablet:border">
                <img src={`svgs/${flagsPerState[stateCovid.uf]}`} alt={`State ${stateCovid.uf}`} className="h-5 mr-4 tablet:h-8 monitor:mr-6" />
                <p className="text-base tablet:text-lg monitor:text-xl">
                  {stateCovid.state}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 tablet:px-8 monitor:px-10 py-5 monitor:py-8">
                <p className="text-sm tablet:text-base monitor:text-lg text-gray-500">Casos: {stateCovid.cases}</p>
                <p className="mt-2 text-sm tablet:text-base monitor:text-lg text-gray-500">Mortes: {stateCovid.deaths}</p>
                <p className="mt-2 text-sm tablet:text-base monitor:text-lg text-gray-500">Suspeitos: {stateCovid.suspects}</p>
                <p className="mt-2 text-sm tablet:text-base monitor:text-lg text-gray-500">
                  Última atualização: {new Date(stateCovid.datetime).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às {new Date(stateCovid.datetime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="bg-white shadow-md overflow-hidden rounded-md mb-4 py-3 px-4 tablet:py-5 tablet:px-8 tablet:px-6 cursor-pointer">
              <div onClick={() => setShowCases(!showCases)} className="flex flex-col">
                <div className="flex w-full justify-between">
                  <p className="text-base tablet:text-lg flex items-center">
                    UF com mais casos
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCases ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </div>
                {showCases && <p className="mt-2 tablet:mt-4 text-sm tablet:text-base monitor:text-lg text-gray-500">{stateWithMostCases?.state}</p>}
              </div>
            </div>

            <div className="bg-white shadow-md overflow-hidden rounded-md mb-4 py-3 px-4 tablet:py-5 tablet:px-8 tablet:px-6 cursor-pointer">
              <div onClick={() => setShowDeaths(!showDeaths)} className="flex flex-col">
                <div className="flex w-full justify-between">
                  <p className="text-base tablet:text-lg flex items-center">
                    UF com mais mortes
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showDeaths ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </div>
                {showDeaths && <p className="mt-5 text-sm tablet:text-base monitor:text-lg text-gray-500">{stateWithMostDeaths?.state}</p>}
              </div>
            </div>

            <div className="bg-white shadow-md overflow-hidden rounded-md mb-4 py-3 px-4 tablet:py-5 tablet:px-8 tablet:px-6 cursor-pointer">
              <div onClick={() => setShowSuspects(!showSuspects)} className="flex flex-col">
                <div className="flex w-full justify-between">
                  <p className="text-base tablet:text-lg flex items-center">
                    UF com mais suspeitos
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSuspects ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                  </svg>
                </div>
                {showSuspects && <p className="mt-5 text-sm tablet:text-base monitor:text-lg text-gray-500">{stateWithMostSuspects?.state}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;