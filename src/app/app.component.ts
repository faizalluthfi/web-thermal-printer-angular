import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  key = 'config';
  form: FormGroup;

  status: string;
  regularlyCheckUpdateSubscribtion: Subscription;
  updateDownloaded: boolean;
  checked: boolean;

  private readonly interval = 600000;
  
  constructor(
    formBuilder: FormBuilder,
    private zone: NgZone
  ) {
    this.form = formBuilder.group({
      web_url: null,
      printer_path: null
    });

    this.loadConfig();
  }

  ngOnInit() {
    let events = [
      'checking-for-update', 
      'update-available', 
      'update-not-available', 
      'error', 
      'download-progress', 
      'update-downloaded'
    ];
    events.forEach(event => {
      window['autoUpdater'].removeAllListeners(event);
    });

    window['autoUpdater'].on('checking-for-update', () => {
      this.zone.run(() => {
        this.checked = false;
        this.status = 'Memeriksa update';
      });
    });
    window['autoUpdater'].on('update-available', () => {
      this.zone.run(() => {
        this.checked = true;
        this.stopRegularUpdateCheck();
        this.status = 'Update tersedia';
      });
    });
    window['autoUpdater'].on('update-not-available', () => {
      this.zone.run(() => {
        this.checked = true;
        this.status = '';
        this.startRegularUpdateCheck();
      });
    });
    window['autoUpdater'].on('error', () => {
      this.zone.run(() => {
        this.status = this.checked ? 'Update gagal' : 'Gagal memeriksa update'
        this.startRegularUpdateCheck();
      });
    });
    window['autoUpdater'].on('download-progress', progressObj => {
      this.zone.run(() => {
        const status = `Mendownload ${Math.floor(progressObj.percent)}%`;
        this.status = status;
        this.updateDownloaded = false;
      });
    });
    window['autoUpdater'].on('update-downloaded', info => {
        this.zone.run(() => {
          this.status = `Versi ${info.version} siap pasang`
          this.updateDownloaded = true;
          let notification = {
            title: 'Update berhasil didownload',
            body: 'Update otomatis dipasang ketika aplikasi dibuka selanjutnya.'
          };
          new Notification(notification.title, notification);
          this.startRegularUpdateCheck();
        });
    });

    let timedNotification = timer(2000);
    timedNotification.subscribe(() => {
      this.checkForUpdates();
    });
  }

  checkForUpdates() {
    window['autoUpdater'].checkForUpdates();
  }

  startRegularUpdateCheck() {
    this.zone.runOutsideAngular(() => {
      let regularlyCheckUpdate = timer(this.interval);
      this.regularlyCheckUpdateSubscribtion = regularlyCheckUpdate.subscribe(() => this.checkForUpdates());
    });
  }

  stopRegularUpdateCheck() {
    if (this.regularlyCheckUpdateSubscribtion) {
      this.regularlyCheckUpdateSubscribtion.unsubscribe();
    }
  }

  applyUpdate() {
    window['ipcRenderer'].send('apply-update');
  }

  loadConfig() {
    const config = JSON.parse(localStorage.getItem(this.key)) || {};
    if (config.printer_path) window['ipcRenderer'].send('init-printer', config.printer_path);
    this.form.patchValue(config);
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
