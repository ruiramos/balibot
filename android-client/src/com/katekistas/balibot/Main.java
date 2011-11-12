package com.katekistas.balibot;

import java.io.IOException;
import java.net.Inet4Address;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceInfo;
import javax.jmdns.ServiceListener;
import javax.jmdns.ServiceEvent;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.Intent;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiManager.MulticastLock;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Vibrator;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class Main extends Activity {
	private JmDNS jmdns;
	MulticastLock lock;
	protected ServiceListener listener;

	private static final String TAG = "Main";
	private static final String MDNS_TYPE = "_balibot._tcp.local.";
	
	private Inet4Address serverAddress;
	private int serverPort;
	private String serverName;
	
	private Client client = Client.getInstance();
	private ProgressDialog loading;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		client.setContext(this);
		loading = ProgressDialog.show(this, "", "Looking for game server...", true);
		FindServerTask task = new FindServerTask(false);
		task.execute();
	}
	
	protected void onDestroy() {
		super.onDestroy();
		if (lock != null) lock.release();
	}
	
	protected void onResume() {
		super.onResume();
  }
	
	protected void onPause() {
		super.onPause();
	}
	
	public void findServers() {
		try {
			WifiManager wifi = (WifiManager) getSystemService(Context.WIFI_SERVICE);
			lock = wifi.createMulticastLock("HeeereDnssdLock");
			lock.setReferenceCounted(true);
			lock.acquire();
			
			jmdns = JmDNS.create();
			jmdns.addServiceListener(MDNS_TYPE, listener = new ServiceListener() {
				public void serviceAdded(ServiceEvent event) {
					Log.v(TAG, "Service added: "+event.getName()+"."+event.getType());
				}
				public void serviceRemoved(ServiceEvent event) {
					Log.v(TAG, "Service removed: "+event.getName()+"."+event.getType());
				}
				public void serviceResolved(ServiceEvent event) {
					Log.v(TAG, "Service resolved: " + event.getInfo());
				}
			});
			ServiceInfo[] infos = jmdns.list(MDNS_TYPE);
			if (infos != null && infos.length > 0) {
				for (int i=0; i<infos.length; i++) {
					serverAddress = infos[i].getInet4Addresses()[0];
					serverPort = infos[i].getPort();
					serverName = infos[i].getName();
					Log.d(TAG, "Encontrei "+serverAddress.getHostAddress()+" "+serverPort);
				}
			}
			Log.d(TAG, "Removendo o listener de MDNS");
			jmdns.removeServiceListener(MDNS_TYPE, listener);
	    jmdns.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	private class FindServerTask extends AsyncTask<Void, Void, Void> {
		public FindServerTask(boolean showLoading) {
			super();
		}
		
		protected Void doInBackground(Void... args) {
			findServers();
			return null;
		}
		
		protected void onProgressUpdate(Void... unused) {
		}
		
		protected void onPostExecute(Void result) {
			serverFound();
		}
	}
  
	public void serverFound() {
		TextView server = (TextView) findViewById(R.id.server_text);
		if (serverAddress != null) {
			server.setText("Server '"+serverName+"' ("+serverAddress.getHostAddress()+": "+serverPort+")");
			Button connect = (Button) findViewById(R.id.connect);
			connect.setEnabled(true);
		}
		loading.dismiss();
	}
	
	public void _rescan(View view) {
		loading = ProgressDialog.show(this, "", "Looking for game server...", true);
		FindServerTask task = new FindServerTask(false);
		task.execute();
	}
	
	public void _connect(View view) {
		Button connect = (Button) findViewById(R.id.connect);
		// Already connected -> Disconnect
		if (client.isConnected()) {
			connect.setText("Connect");
			client.disconnect();
		} else {
			EditText name = (EditText) findViewById(R.id.name);
			client.setName(name.getText().toString());
			Log.d(TAG, "Vou connectar a: "+serverAddress.getHostAddress()+": "+serverPort);
			if (client.connect(serverAddress.getHostAddress(), serverPort)) {
				Vibrator vibrator = (Vibrator)getSystemService(Context.VIBRATOR_SERVICE);
        vibrator.vibrate(400);
				connect.setText("Disconnect");
				Intent gameIntent = new Intent(this, Game.class);
				this.startActivity(gameIntent);
			} else {
				Log.d(TAG, "FAIL DE CONNECT!");
			}
		}
	}
}