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
import android.content.SharedPreferences;
import android.graphics.Typeface;
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
	
	private String serverAddress;
	private int serverPort;
	private String serverName;
	
	private Client client = Client.getInstance();
	private ProgressDialog loading;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		client.setContext(this);
		
		Typeface tf = Typeface.createFromAsset(getAssets(), "bitwa.ttf");
    TextView title = (TextView)findViewById(R.id.title);
    title.setIncludeFontPadding(false);
    title.setLineSpacing(0.0f, 1f);
    title.setTypeface(tf);
    
    Typeface commodore = Typeface.createFromAsset(getAssets(), "commodore.ttf");
    TextView serverTxt = (TextView)findViewById(R.id.server_text);
    serverTxt.setIncludeFontPadding(false);
    serverTxt.setLineSpacing(0.0f, 1f);
    serverTxt.setTypeface(commodore);
    
		// Restore preferences
    SharedPreferences settings = getSharedPreferences("katekistas", 0);
    String name = settings.getString("name", "");
    String savedAddress = settings.getString("s_address", "");
    int savedPort = settings.getInt("s_port", 0);
    String savedName = settings.getString("s_name", "");
    
    // Already have name, hide editbox
    if (!name.equals("")) {
    	EditText nameEdit = (EditText) findViewById(R.id.name);
    	nameEdit.setText(name);
    	nameEdit.setVisibility(View.INVISIBLE);
			client.setName(name);
    }
		
    // Already have server
    if (!savedAddress.equals("")) {
    	serverAddress = savedAddress;
    	serverPort = savedPort;
    	serverName = savedName;
    	serverFound();
    } else {
    	loading = ProgressDialog.show(this, "", "Looking for game server...", true);
    	FindServerTask task = new FindServerTask(false);
    	task.execute();
    }
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
		EditText nameEdit = (EditText) findViewById(R.id.name);
		SharedPreferences settings = getSharedPreferences("katekistas", 0);
    SharedPreferences.Editor editor = settings.edit();
    editor.putString("name", nameEdit.getText().toString());
    editor.putString("s_address", serverAddress);
    editor.putInt("s_port", serverPort);
    editor.putString("s_name", serverName);
    editor.commit();
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
					serverAddress = infos[i].getInet4Addresses()[0].getHostAddress();
					serverPort = infos[i].getPort();
					serverName = infos[i].getName();
					Log.d(TAG, "Encontrei "+serverAddress+" "+serverPort);
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
			server.setText("Server '"+serverName+"' ("+serverAddress+":"+serverPort+")");
			Button connect = (Button) findViewById(R.id.connect);
			connect.setEnabled(true);
		}
		if (loading != null) {
			loading.dismiss();
		}
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
			Log.d(TAG, "Vou connectar a: "+serverAddress+": "+serverPort);
			if (client.connect(serverAddress, serverPort)) {
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