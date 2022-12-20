//
//  MyViewController.swift
//  App
//
//  Created by sultanmyrza on 2022/12/3.
//

import UIKit
import Capacitor

class MyViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    
    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        let webView = WKWebView(frame: frame, configuration: configuration)
        webView.isOpaque = false
        return webView
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
