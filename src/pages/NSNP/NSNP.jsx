import "../../scss/custom.scss";
import "./NSNP.css";
import NewNodeForm from "../../components/NSnapse/forms/NewNodeForm";
import NewInputForm from "../../components/NSnapse/forms/NewInputForm";
import EditNodeForm from "../../components/NSnapse/forms/EditNeuronForm";
import DeleteForm from "../../components/NSnapse/forms/DeleteForm";
import { Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import Menu from "../../components/Prototype/Menu/Menu";

import { useViewer } from "../../utils/hooks/useViewer";
import { useMatrixData } from "../../utils/hooks/useMatrixData";
import { useSystemHistory } from "../../utils/hooks/useSystemHistory";
import localStorageMatrices from "../../utils/hooks/useLocalStorage";
import Matrices from "../../components/Prototype/Matrices/Matrices";
import WorkSpace from "../../components/Prototype/WorkSpace/WorkSpace";
import Graph from "../../components/Prototype/Graph/Graph";
import SubHeader from "../../components/Prototype/SubHeader/SubHeader";
import generateConfigurations from "../../utils/SimAlgs/generateConfiguration";
import { loadSystem, saveSystem } from "../../utils/saveload";
import ClearAllForm from "../../components/NSnapse/forms/ClearAllForm";
import NewOutputForm from "../../components/NSnapse/forms/NewOutputForm";
import AddSynapse from "../../components/NSnapse/forms/AddSynapse";
import DeleteSynForm from "../../components/NSnapse/forms/DeleteSynForm";

function NSNP() {
  // Control States
  const [timeSteps, setTimeSteps] = useState(0);
  const [guidedMode, setGuidedMode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDev, setDev] = useState(false);
  // States for the History
  const [CHist, setCHist] = useState([]);
  const [SHist, setSHist] = useState([]);
  const [PHist, setPHist] = useState([]);

  // State for System History

  // States for the System
  const {
    C,
    setC,
    VL,
    setVL,
    F,
    setF,
    L,
    setL,
    T,
    setT,
    syn,
    setSyn,
    envValue,
    setEnvValue,
    envSyn,
    setEnvSyn,
    SV,
    setSV,
    PM,
    setPM,
  } = useMatrixData();
  const [neuronPositions, setNeuronPositions] = useState([]);
  let matrixProps = {
    C: C,
    VL: VL,
    F: F,
    L: L,
    T: T,
    syn: syn,
    envSyn: envSyn,
    neuronPositions: neuronPositions,
    setC: setC,
    setVL: setVL,
    setF: setF,
    setL: setL,
    setT: setT,
    setSyn: setSyn,
    setEnvSyn: setEnvSyn,
    setCHist: setCHist,
    setNeuronPositions: setNeuronPositions,
  };

  const {
    systemStack,
    positionStack,
    systemStackMessage,
    systemStackPointer,
    pushSystem,
    undoSystemChange,
    redoSystemChange,
  } = useSystemHistory(matrixProps);

  //States for Viewing WorkSpace components
  const {
    showNonSimMatrices,
    setShowNonSimMatrices,
    showSPMatrices,
    setShowSPMatrices,
    showConfigHist,
    setShowConfigHist,
    showSettings,
    setShowSettings,
    showGraph,
    setShowGraph,
  } = useViewer();

  const [selectedNode, setSelectedNode] = useState("");
  const [selectedSyn, setSelectedSyn] = useState("");

  function handleGeneration() {
    let matrices = generateConfigurations(
      guidedMode,
      [C],
      1,
      L,
      F,
      T,
      VL,
      syn,
      envSyn
    );
    let newC = matrices.unexploredStates[0];

    let newS = matrices.S;
    let newP = matrices.P;
    setC(newC);
    setSV(newS);
    setPM(newP);
    setCHist((CHist) => [...CHist, C]);
    setPHist((PHist) => [...PHist, newP]);
    setSHist((SHist) => [...SHist, newS]);
    setEnvValue((envValue) => [...envValue, matrices.finalEnvValue]);

    setShowNonSimMatrices(false);
    setShowSPMatrices(true);
    setTimeSteps(timeSteps + 1);
  }

  function handleReset() {
    if (timeSteps == 0) {
      return;
    }
    setC(CHist[0]);
    setSV([]);
    setPM([]);
    setCHist([]);
    setPHist([]);
    setSHist([]);
    setTimeSteps(0);
    setEnvValue([]);
  }

  function handleUndo() {
    if (timeSteps == 0) {
      return;
    }
    let newC = CHist[timeSteps - 1];
    let newS = SHist[timeSteps - 1];
    let newP = PHist[timeSteps - 1];
    setC(newC);
    setSV(newS);
    setPM(newP);
    setCHist(CHist.slice(0, timeSteps - 1));
    setPHist(PHist.slice(0, timeSteps - 1));
    setSHist(SHist.slice(0, timeSteps - 1));
    setEnvValue(envValue.slice(0, timeSteps - 1));
    setTimeSteps(timeSteps - 1);
  }

  function handleRewind(index) {
    if (timeSteps == 0 || index > timeSteps) {
      return;
    }
    let newC = CHist[index];
    let newS = SHist[index];
    let newP = PHist[index];
    setC(newC);
    setSV(newS);
    setPM(newP);
    setCHist(CHist.slice(0, index));
    setPHist(PHist.slice(0, index));
    setSHist(SHist.slice(0, index));
    setEnvValue(envValue.slice(0, index));
    setTimeSteps(index);
  }

  function handleSave(matrixProps) {
    saveSystem(matrixProps);
  }

  function handleLoad(target, matrixProps) {
    loadSystem(target, matrixProps);
  }

  function handleShowGraph() {
    setShowGraph(!showGraph);
  }

  function handleEditMatrices() {
    setShowNonSimMatrices(!showNonSimMatrices);
    setShowSPMatrices(!showSPMatrices);
  }
  function resetDev() {
    setShowGraph(true);
    setShowNonSimMatrices(false);
    setShowSPMatrices(false);
  }

  return (
    <>
      <Menu
        load={handleLoad}
        {...matrixProps}
        save={handleSave}
        set={setDev}
        reset={resetDev}
      />

      <div className="body">
        <div className="nsnpheader">
          <center>
            <h1>NSN P Simulator</h1>
          </center>
          <div className="actionselector">
            <NewNodeForm {...matrixProps} pushSystem={pushSystem} />
            <NewInputForm />
            <NewOutputForm
              {...matrixProps}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
            {/* place holders */}

            <EditNodeForm
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
            <DeleteForm
              {...matrixProps}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
            <ClearAllForm
              {...matrixProps}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
            />
          </div>
          <div className="actionselector">
            <AddSynapse
              {...matrixProps}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              setSelectedSyn={setSelectedSyn}
              selectedSyn={selectedSyn}
            />
            <DeleteSynForm
              {...matrixProps}
              selectedSyn={selectedSyn}
              setSelectedSyn={setSelectedSyn}
            />
          </div>
          <SubHeader
            forward={handleGeneration}
            reset={handleReset}
            undo={handleUndo}
            edit={handleEditMatrices}
            number={timeSteps}
            checked={showGraph}
            checkbox={handleShowGraph}
            dev={isDev}
          />
        </div>

        {/* Matrix Inputs */}
        {showNonSimMatrices && <Matrices {...matrixProps} />}
        {/* Graph Workspace */}
        {!showNonSimMatrices && showGraph && (
          <Graph
            {...matrixProps}
            envValue={envValue}
            setEnvValue={setEnvValue}
            selectedNode={selectedNode}
            selectedSyn={selectedSyn}
            setSelectedNode={setSelectedNode}
            setSelectedSyn={setSelectedSyn}
          />
        )}
        {/* Matrix Outputs */}
        {showSPMatrices && !showGraph && <WorkSpace C={C} SV={SV} PM={PM} />}
      </div>
    </>
  );
}
export default NSNP;
