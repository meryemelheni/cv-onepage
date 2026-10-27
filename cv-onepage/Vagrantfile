# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"
  config.vm.hostname = "garderie-vm"

  # Réseau privé avec IP fixe
  config.vm.network "private_network", ip: "192.168.56.10"
  
  # Redirection de port pour accéder à l'application depuis Windows
  config.vm.network "forwarded_port", guest: 3000, host: 3003

  config.vm.provider :libvirt do |lv|
    lv.memory = 2048
    lv.cpus = 2
  end

  # Provisioning Ansible exécuté DANS la VM
  config.vm.provision "ansible_local" do |ansible|
    ansible.provisioning_path = "/vagrant/ansible"
    ansible.playbook = "site.yml"
    ansible.install_mode = "default"
    ansible.compatibility_mode = "2.0"
    ansible.limit = "all"
  end
end
