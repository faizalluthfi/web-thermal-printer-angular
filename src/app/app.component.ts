import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  key = 'config';
  form: FormGroup;
  
  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      web_url: null,
      printer_path: null
    });

    this.loadConfig();
  }

  loadConfig() {
    this.form.patchValue(
      JSON.parse(localStorage.getItem(this.key)) || {}
    );
  }

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.form.value));

    const url = this.form.value.web_url;
    if (url) window.location.href = url;
  }

  testPrinter() {
    window['ipcRenderer'].sendSync('test-printer', {printerPath: this.form.value.printer_path}) && window.alert('Print berhasil');
  }
}
