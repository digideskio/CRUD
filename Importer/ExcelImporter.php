<?php
namespace CRUD\Importer;
use PHPExcel_IOFactory;
use LazyRecord\BaseModel;
use LazyRecord\Schema\DeclareSchema;
use PHPExcel;
use PHPExcel_Cell;
use Exception;

/**
 * Handle data import from excel file
 */
class ExcelImporter
{
    const IDENTIFY_BY_PRIMARY_KEY = 1;

    const IDENTIFY_BY_COLUMNS = 2;

    protected $schema;

    protected $importFields;

    protected $skipBy = self::IDENTIFY_BY_PRIMARY_KEY;

    public function __construct($schema, array $importFields = null)
    {
        $this->schema = $schema;
        $this->importFields = $importFields ?: $this->schema->getColumnNames();
    }

    public function createSampleExcel($generateSampleContent = false)
    {
        $excel = new PHPExcel;
        /*
        $excel->getProperties()->setCreator("Maarten Balliauw")
            ->setLastModifiedBy("Maarten Balliauw")
            ->setTitle("Office 2007 XLSX Test Document")
            ->setSubject("Office 2007 XLSX Test Document")
            ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
            ->setKeywords("office 2007 openxml php")
            ->setCategory("Test result file")
            ;
        */
        $columnKeys = range('A', 'Z');
        $columnKeys = array_splice($columnKeys, 0, count($this->importFields));

        $sheet = $excel->setActiveSheetIndex(0);

        // outout headers
        foreach ($columnKeys as $index => $key) {
            $field = $this->importFields[$index];
            $sheet->setCellValue($key . '1', $this->schema->getColumn($field)->name);
        }

        // generate sample data from placeholder
        if ($generateSampleContent) {
            for ($i = 2 ; $i < 5 ; $i++) {
                foreach ($columnKeys as $index => $key) {
                    $field = $this->importFields[$index];
                    $sheet->setCellValue($key . $i, $this->schema->getColumn($field)->placeholder ?: 'sample');
                }
            }
        }

        return $excel;
    }

    public function import($filepath)
    {
        $excel = PHPExcel_IOFactory::load($filepath);
        $sheet   = $excel->getActiveSheet();
        $sheetTitle  = $sheet->getTitle();
        $rowIterator = $sheet->getRowIterator();

        $headers = array();
        $cellIterator = $rowIterator->current()->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false); // Loop all cells, even if it is not set
        foreach ($cellIterator as $cell) {
            $headers[] = $cell->getCalculatedValue();
        }


        $imported = 0;
        $skipped = 0;

        $records = [];
        $rowIterator->next(); // skip the header row
        while ($rowIterator->valid()) {
            $row = $rowIterator->current();
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false); // Loop all cells, even if it is not set

            $data = [];
            foreach ($cellIterator as $cell) {
                $index = PHPExcel_Cell::columnIndexFromString($cell->getColumn()) - 1;
                $key = $headers[$index];
                if ($column = $this->schema->getColumn($key)) {
                    $text = trim($cell->getCalculatedValue());

                    if ($column->isa == 'int') {
                        $data[$key] = intval($text);
                    } else if ($column->isa == 'bool') {
                        $data[$key] = filter_var($text, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                    } else {
                        $data[$key] = $text;
                    }
                }
            }

            $record = $this->schema->newModel();

            if ($this->skipBy == self::IDENTIFY_BY_PRIMARY_KEY) {
                if (isset($data[$this->schema->primaryKey])) {
                    $ret = $record->find($data[$this->schema->primaryKey]);
                    if ($ret->success) {
                        $skipped++;
                        $rowIterator->next();
                        continue;
                    }
                }
            }

            $ret = $record->create($data);
            if ($ret->error) {
                throw new Exception('Import error: ' . $ret->message);
            }
            $imported++;
            $rowIterator->next();
            $records[] = $record;
        }
        return [$imported, $skipped, $records];
    }

    /**
     * @return array [ 'headers' => ..., 'rows' => .... ]
     */
    public function preview($filepath, $maxRows = 5)
    {
        $return = [];
        $excel = PHPExcel_IOFactory::load($filepath);
        $worksheet   = $excel->getActiveSheet();
        $sheetTitle  = $worksheet->getTitle();
        $rowIterator = $worksheet->getRowIterator();

        $headers = array();
        $cellIterator = $rowIterator->current()->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false); // Loop all cells, even if it is not set
        foreach ($cellIterator as $cell) {
            $headers[] = $cell->getCalculatedValue();
        }
        $return['headers'] = $headers;

        $rows = [];
        $rowIterator->next(); // skip the header row
        while ($maxRows-- && $rowIterator->valid()) {
            $row = $rowIterator->current();

            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false); // Loop all cells, even if it is not set

            $rowArray = [];
            foreach ($cellIterator as $cell) {
                $rowArray[] = trim($cell->getCalculatedValue());
            }
            $rowIterator->next();
            $rows[] = $rowArray;
        }
        $return['rows'] = $rows;
        return $return;
    }
}


