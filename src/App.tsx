import {useState, useMemo, useEffect} from 'react'
import api from './api';
import {AgGridReact} from 'ag-grid-react';
import {
    AllCommunityModule,
    ColDef,
    ModuleRegistry,
    SelectionChangedEvent,
    CellValueChangedEvent,
    RowClassParams
} from 'ag-grid-community';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

let dataLoaded = false;

function App() {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadData() {
            dataLoaded = true;
            for (let i = 0; i < 10; i++) {
                const d = await api();
                setRowData(prev => [...prev, ...d]);
            }
            setLoading(false);
        }

        if (!dataLoaded) {
            // prevent dev env firing twice
            loadData();
        }
    }, [rowData, loading])


    useEffect(() => {
        const warnBeforeLeaving = (e: BeforeUnloadEvent) => {
            if (rowData.some(i => i.edited)) {
                e.preventDefault();
                return "You have unsaved changes";
            }
            return undefined;
        }

        window.addEventListener("beforeunload", warnBeforeLeaving);
        return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
    }, [rowData])

    const defaultColDef = useMemo<ColDef>(() => ({
        filter: true,
        floatingFilter: true,
        editable: true
    }), []);

    const colDefs = useMemo<ColDef[]>(() => [
        {field: 'startYear', headerName: 'Start Year'},
        {field: 'endYear', headerName: 'End Year'},
        {field: "make"},
        {field: "model"},
        {field: "price"},
        {field: "electric"},
    ], []);

    const onAddRow = () => setRowData([{
        id: '', startYear: 0, endYear: null, make: '', model: '', price: 0, electric: false, edited: true
    }, ...rowData])

    const [rowSelected, setRowSelected] = useState<string[]>([]);
    const onSelection = (e: SelectionChangedEvent<Vehicle>) => {
        setRowSelected(e.api.getSelectedRows().map(d => d.id));
    }
    const onDelete = () => {
        const filtered = rowData.filter(f => rowSelected.findIndex(rs => rs === f.id) === -1);
        setRowData(filtered);
    }

    const onCellValueChanged = (event: CellValueChangedEvent<Vehicle>) => {
        console.log("Data after change is", event.data);
        // set edited = true, this can be used later to save it all in a batch
        const editedIdx = rowData.findIndex(i => i.id === event.data.id);
        setRowData(prev => prev.map((item, idx) => editedIdx === idx ? {
            ...item,
            edited: true
        } : item))
    }

    const getRowStyle = (params: RowClassParams<Vehicle>) => {
        if (params.data?.edited) {
            return {background: 'yellow'};
        }
    };

    const edited = rowData.filter(v => v.edited).length;

    return (
        <>
            <div style={{height: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                <button style={{backgroundColor: edited ? 'yellow' : 'initial'}}>Save ({edited})</button>
                <button style={{marginLeft: '0.5rem'}} onClick={onAddRow}>Add Row</button>
                <button style={{marginLeft: '0.5rem'}}
                        onClick={onDelete}
                        disabled={rowSelected.length < 1}>
                    Delete ({rowSelected.length})
                </button>
            </div>
            <div
                style={{height: 'calc(100vh - 2rem)', width: '100vw'}}
            >
                <AgGridReact
                    rowData={rowData}
                    rowSelection={{mode: 'multiRow'}}
                    onSelectionChanged={onSelection}
                    defaultColDef={defaultColDef}
                    columnDefs={colDefs}
                    loading={loading}
                    undoRedoCellEditing={true}
                    onCellValueChanged={onCellValueChanged}
                    getRowStyle={getRowStyle}
                    suppressScrollOnNewData={true}
                />
            </div>
        </>
    )
}

export default App
