export interface Passage {
  id: number;
  title: string;
  content: string;
}

export interface EvaluationResult {
  docDayDu: boolean; // Thêm trường này để kiểm tra độ hoàn chỉnh
  tongDiem: number;
  doLuuLoat: number;
  phatAm: number;
  doChinhXac: number;
  nhanXetChung: string;
  tuPhatAmSai: {
    tu: string;
    phatAmSai: string;
    suaLai: string;
  }[];
  diemTichCuc: string[];
}

export interface StudentInfo {
  name: string;
  class: string;
}

export type Page = 'welcome' | 'passage-list' | 'reading' | 'evaluation';

export type SheetSaveStatus = 'idle' | 'saving' | 'success' | 'error';