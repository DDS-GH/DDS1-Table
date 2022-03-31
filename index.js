import './src/style.css';
import { dataNodes, arrayRemove, rndChr } from './src/mock';
import { createElement } from './src/utilities';

const columnIdIndex = 2;
let tableElement;
let dlsTable;
let allSelectedRows = []; // this would be a list of selections that we maintain manually
let allCheckboxListeners = [];
const instanceId = Math.floor(Math.random() * 999) + 1;
const tOptions = {
  settings: false,
  print: false,
  import: false,
  column: true,
  sort: true,
  select: true,
  expand: true,
  condensed: true,
  fixedColumns: true,
  fixedHeight: false,
  exportDetails: false,
  exportFileName: 'order_export',
  disablePaginationInput: true,
  header: true,
  text: {
    batchActions: 'Actions',
    noEntries: 'Nothing was found',
  },
  defaultBatchActions: {
    exportCsv: false,
    exportJson: false,
    delete: true,
  },
  additionalActions: [],
  search: false,
  actions: false,
  perPage: 3,
  perPageSelect: [3, 5, 7, 15, 30],
  data: {
    headings: [
      'Order ID',
      'WorkOrder ID',
      'Company Name',
      'Part Number',
      'Part Qty',
      'Status',
    ],
    columns: [
      {
        select: [0],
        sortable: true,
      },
      {
        select: [1],
        hidden: true,
      },
    ],
    rows: dataNodes(5, 10),
  },
};

// you can use fetch() as below, or the angular way with rxjs Observables
async function getData() {
  // in THIS sandbox, we're not really using the data fetched here FYI
  const data = await fetch('https://jsonplaceholder.typicode.com/users/').then(
    (response) => response.json()
  );
  return data;
}

async function createOptions(data) {
  // here we can set the parameters we want ...
  // but we're just returning the local object
  return tOptions;
}

const logRows = () => {
  console.log('showSelectedRows', {
    visiblySelectedRowIndices: tableElement.selectedRows,
    storedRowIds: allSelectedRows,
  });
};

const noData = () => {
  const firstRow = tableElement.querySelector(`tr`);
  const colCount = firstRow.querySelectorAll(`th`).length;
  allSelectedRows = [];
  tableElement.selectedRows = [];
  const options = {
    ...tOptions,
    data: {
      headings: tOptions.data.headings,
      columns: tOptions.data.columns,
      rows: [],
    },
  };
  reloadTableData(options);
  reselectRows(allSelectedRows);
  // tableElement.appendChild
  const noCol = document.createElement(`td`);
  noCol.setAttribute(`colspan`, colCount);
  noCol.style.textAlign = `center`;
  noCol.innerText = `No Results`;
  const noRow = document.createElement(`tr`);
  noRow.id = `noRow${instanceId}`;
  noRow.appendChild(noCol);
  tableElement.appendChild(noRow);
};

const updateData = () => {
  const whichIdsSelected = [];
  let tableRows = tableElement.querySelectorAll(`tr`);
  console.log(tableRows);
  tableElement.selectedRows.forEach((rowIndex) => {
    const columnTd = tableRows[rowIndex].querySelectorAll('td')[columnIdIndex];
    if (columnTd) {
      console.log(`columnTd is defined`, columnTd.innerText);
      whichIdsSelected.push(columnTd.innerText);
    } else {
      console.error(`Error selecting column`);
    }
  });
  tableElement.selectedRows = [];

  // generate some new part numbers (pretend we get new data)
  const options = {
    ...tOptions,
    data: {
      headings: tOptions.data.headings,
      columns: tOptions.data.columns,
      rows: dataNodes(6, 11),
    },
  };
  /*
          in this method where you get new data, you might be retrieving
          a new object that doesn't map up to the table data structure.
          You'll just want to map that like:
          newData.map((obj) => {
              return {
                  data: [
                      obj.salesOrderId,
                      obj.woid.toString(),
                      obj.company_name,
                      obj.partList.length ? obj.partList[0]["partNum"].toString() : "",
                      obj.partList.length ? obj.partList[0]["partQty"].toString() : "",
                      obj.statusDesc,
                  ],
              };
          })
      */
  reloadTableData(options);
  reselectRows(whichIdsSelected);
  setTimeout(() => {
    dlsTable.page(0);
  });
};

const reselectRows = (whichIdsSelected) => {
  tableElement.selectedRows = [];
  // go back through and re-select rows if their IDs are showing
  const tableRows = tableElement.querySelectorAll(`tr`);
  tableRows.forEach((tRow, rowIndex) => {
    if (tRow.querySelectorAll('td')[columnIdIndex]) {
      // HARDCODED HERE ! Your ID must be showing and in a certain column
      const rowId = tRow.querySelectorAll('td')[columnIdIndex].innerText;
      if (whichIdsSelected.includes(rowId)) {
        tableElement.selectedRows.push(rowIndex - 1);
        tRow.querySelector('input').checked = true;
      }
    }
  });
  const firstRow = tableElement.querySelector('tr');
  firstRow.querySelector('input').indeterminate = false;
  firstRow.querySelector('input').checked = false;
  if (whichIdsSelected.length > 0) {
    if (whichIdsSelected.length >= tableRows.length) {
      firstRow.querySelector('input').checked = true;
    } else {
      firstRow.querySelector('input').indeterminate = true;
    }
  }
  console.log('reselectRows', {
    selectedRows: tableElement.selectedRows,
    whichIdsSelected: whichIdsSelected,
  });
};

const reloadTableData = (options) => {
  const noRow = tableElement.querySelector(`#noRow${instanceId}`);
  if (noRow) noRow.remove();

  dlsTable.deleteAll();

  // converts all to strings
  options.data.rows.map((r, rI) => {
    r.data.map((td, tdI) => {
      options.data.rows[rI].data[tdI] = td.toString();
    });
  });

  dlsTable.import(options);
  console.log(dlsTable);
  if (dlsTable) {
    dlsTable.setItems(options.data.rows.length);
    setTimeout(() => {
      dlsTable.page(1);
    });
  }
  renderInlineComponents();
};

const renderInlineComponents = () => {
  renderTablePlaceholders();
  renderTooltipPlaceholders();
};

const addListeners = () => {
  document.getElementById(`updateData`).addEventListener(`click`, updateData);
  document.getElementById(`noData`).addEventListener(`click`, noData);
  document.getElementById(`logRows`).addEventListener(`click`, logRows);

  const allBox = tableElement.querySelector(`.dds__table-cmplx-select-all`);
  // monitor for selectAll (select all)
  allBox.addEventListener(`input`, (e) => {
    allSelectedRows = [];
    if (e.target.checked) {
      tOptions.data.rows.forEach((rowObj) => {
        allSelectedRows.push(rowObj.data[0]);
      });
      console.log(
        `${tOptions.data.rows.length} rows selected`,
        allSelectedRows
      );
    }
  });

  document.addEventListener('uicPaginationPageUpdateEvent', (e) => {
    // update the DOM row selection
    reselectRows(allSelectedRows);
    renderInlineComponents();
  });

  addSelectRowListeners();
};

const addSelectRowListeners = () => {
  allCheckboxListeners.forEach((cbListener) => {
    cbListener.removeEventListener(`click`, handleCbClick);
  });
  allCheckboxListeners = [];
  tableElement
    .querySelectorAll(`.dds__table-cmplx-row-select input`)
    .forEach((cb) => {
      allCheckboxListeners.push(cb);
      cb.addEventListener(`click`, handleCbClick);
    });
};

const handleCbClick = (e) => {
  console.log(`handleCbClick`);
  // this is a little hardcoded to the particular data, presuming the "ID" of the row is column 1
  const orderId =
    e.target.parentElement.parentElement.querySelectorAll('td')[1].innerText;
  if (allSelectedRows.includes(orderId)) {
    allSelectedRows = arrayRemove(allSelectedRows, orderId);
  } else {
    allSelectedRows.push(orderId);
  }
  reselectRows(allSelectedRows);
};

const renderTablePlaceholders = () => {
  tableElement.querySelectorAll('tableplaceholder').forEach((ph) => {
    const rowId = ph.innerHTML.trim();
    const newDiv = createElement('div', {
      style: 'background: white;',
    });
    const newTable = createElement('table', {
      id: rowId,
      'data-table': 'dds__table',
      class: 'dds__table dds__table-hover dds__table-cmplx',
      'data-table-data': `{"showData":false,"search":false,"select":false,"settings":false,"sort":false,"expand":false,"fixedColumns":true,"fixedHeight":false,"header":true,
      "data":{"headings":["Name","Company","Extension","Start Date","Email","Phone","Link"],
      "columns":[{"select":0,"sort":"asc","fixed":true},{"select":[1,2],"hidden":true,"fixed":true},{"select":3,"type":"date","format":"MM/DD/YYYY","sortable":true}],
      "rows":[{"data":["Hedwig F. Nguyen","Arcu Vel Foundation","9875","03/27/2017","nunc.ullamcorper@metusvitae.com","070 8206 9605","<a href=&#39;//www.dell.com&#39;>Dell Home Page</a>"]},{"data":["Genevieve U. Watts","Eget Incorporated","9557","07/18/2017","Nullam.vitae@egestas.edu","0800 025698","<a href=&#39;//www.dell.com&#39;>Dell Home Page</a>"],"details":"Genevieve U. Watts details"}]}}`,
    });
    newDiv.appendChild(newTable);
    ph.parentElement.appendChild(newDiv);
    ph.remove();
    UIC.Table(document.getElementById(rowId));
  });
};

const renderTooltipPlaceholders = () => {
  tableElement.querySelectorAll('tooltipplaceholder').forEach((ph) => {
    const rowId = ph.innerHTML.trim();
    const newEl = createElement('button', {
      id: rowId,
      class: 'dds__icons dds__alert-info-cir dds__tooltip-icon',
      'data-toggle': 'dds__tooltip',
      'data-placement': 'top',
      'aria-label': 'information',
      'data-title': `Tip ${rndChr()}${rndChr()}: Tooltip on top. Used to display very short, helpful information.`,
    });
    ph.parentElement.appendChild(newEl);
    ph.remove();
    UIC.Tooltip(document.getElementById(rowId));
  });
};

// Some UICore components require SVGs; loadURLSVGs accepts two parameters: an array of the SVGs to load, and a boolean for whether or not to lazy-load.  True by default; this Sandbox requires False.
UIC.loadURLSVGs(
  [
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__search.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__import-alt.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__handle.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__chevron-right.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__chevron-left.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__loading-sqrs.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__arrow-tri-solid-right.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__printer.svg',
    'https://uicore.dellcdn.com/1.6.1/svgs/dds__gear.svg',
  ],
  false
);

getData()
  .then((data) => createOptions(data))
  .then((options) => {
    tableElement = document.querySelector('[data-table="dds__table"]');
    // then and initilize DDS Table element
    dlsTable = new UIC.Table(tableElement, options);
    addListeners();
    renderInlineComponents();
  });
