import {useState, useMemo, useEffect, useCallback, useRef} from 'react'
import api from './api';
import {AgGridReact} from 'ag-grid-react';
import {
    AllCommunityModule,
    ColDef,
    ModuleRegistry,
    SelectionChangedEvent,
    CellValueChangedEvent,
    RowClassParams,
    GetRowIdParams,
} from 'ag-grid-community';
// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

let dataLoaded = false;

function App() {
    const gridRef = useRef<AgGridReact<Vehicle>>(null);
    const getRowId = useCallback((e: GetRowIdParams<Vehicle>) => e.data.id, []);
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState<Vehicle[]>([]);
    // edited is purposefully not stored as a property of each row data item
    const [editedIds, setEditedIds] = useState<Set<string>>(new Set());
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
            if (editedIds.size) {
                e.preventDefault();
                return "You have unsaved changes";
            }
            return undefined;
        }

        window.addEventListener("beforeunload", warnBeforeLeaving);
        return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
    }, [editedIds])

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
        // if we did setRowData, we lose the undo/redo functionality
        // const editedIdx = rowData.findIndex(i => i.id === event.data.id);
        // setRowData(prev => prev.map((item, idx) => editedIdx === idx ? {
        //     ...item,
        //     edited: true
        // } : item))

        // if we just directly edit through the param or grid api then rowData is not updated correctly
        // event.data.edited = true;
        // if (event.node.data) {
        //     event.node.setData({...event.node.data, edited: true})
        // }
        setEditedIds(prev => new Set([event.data.id, ...prev]));
    }

    const getRowStyle = (params: RowClassParams<Vehicle>) => {
        if (params.data?.id && editedIds.has(params.data.id)) {
            return {background: 'yellow'};
        }
    };

    const onSave = () => {
        // get ids from editedId and corresponding from rowData
    }

    return (
        <>
            <div style={{height: '2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                <button style={{backgroundColor: editedIds.size ? 'yellow' : 'initial'}} onClick={onSave}>Save
                    ({editedIds.size})
                </button>
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
                    ref={gridRef}
                    getRowId={getRowId}
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
